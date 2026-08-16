import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, preflightResponse } from "./cors.js";
import { createEmailJsRequest, renderAcademyEmail } from "./email.js";

type Notification = {
  id: string;
  application_id: string;
  event_type: string;
  recipient_email: string | null;
  idempotency_key: string;
  payload: Record<string, unknown>;
  attempts: number;
};

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function secretKey(): string {
  const currentKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (currentKeys) {
    const parsed = JSON.parse(currentKeys) as Record<string, string>;
    if (parsed.default) return parsed.default;
  }
  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function allowedOrigins(): Set<string> {
  return new Set(requiredEnv("ALLOWED_ORIGINS").split(",").map((item) => item.trim()).filter(Boolean).map((item) => new URL(item).origin));
}

function json(origin: string, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

async function equalSecret(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const av = new Uint8Array(a); const bv = new Uint8Array(b);
  return av.length === bv.length && av.every((value, index) => value === bv[index]);
}

async function authorized(request: Request, origin: string): Promise<boolean> {
  const processorSecret = request.headers.get("x-academy-processor-secret") ?? "";
  if (processorSecret && await equalSecret(processorSecret, requiredEnv("ACADEMY_NOTIFICATION_PROCESSOR_SECRET"))) return true;
  if (!origin || !allowedOrigins().has(origin)) return false;
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return false;
  const response = await fetch(`${requiredEnv("SUPABASE_URL")}/auth/v1/user`, {
    headers: { apikey: requiredEnv("SUPABASE_ANON_KEY"), Authorization: authorization },
    signal: AbortSignal.timeout(8_000),
  });
  return response.ok;
}

async function rpc(name: string, body: Record<string, unknown>) {
  const key = secretKey();
  const response = await fetch(`${requiredEnv("SUPABASE_URL")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${name}_${response.status}`);
  return response;
}

async function complete(id: string, delivered: boolean, providerId?: string, failure?: string) {
  await rpc("complete_academy_notification", {
    notification_id: id,
    delivered,
    provider_id: providerId ?? null,
    failure_message: failure ?? null,
  });
}

async function deliver(notification: Notification) {
  try {
    const email = renderAcademyEmail(notification, requiredEnv("ACADEMY_ADMIN_EMAIL"));
    const request = createEmailJsRequest(notification, email, {
      serviceId: requiredEnv("EMAILJS_SERVICE_ID"),
      templateId: requiredEnv("EMAILJS_AUTOREPLY_TEMPLATE_ID"),
      publicKey: requiredEnv("EMAILJS_PUBLIC_KEY"),
      privateKey: Deno.env.get("EMAILJS_PRIVATE_KEY")?.trim() || undefined,
      replyToEmail: requiredEnv("ACADEMY_ADMIN_EMAIL"),
    });
    const response = await fetch(request.url, { ...request.init, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      await complete(notification.id, false, undefined, `emailjs_${response.status}`);
      return false;
    }
    await complete(notification.id, true, `emailjs:${notification.id}`);
    return true;
  } catch (error) {
    const code = error instanceof Error && /^[a-z_]+(?:_\d{3})?$/.test(error.message)
      ? error.message : "delivery_unexpected";
    await complete(notification.id, false, undefined, code).catch(() => undefined);
    return false;
  }
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") ?? "";
  try {
    if (request.method === "OPTIONS") {
      if (!origin || !allowedOrigins().has(origin)) return json(origin, 403, { ok: false });
      return preflightResponse(origin);
    }
    if (request.method !== "POST") return json(origin, 405, { ok: false, error: "Method not allowed." });
    if (!await authorized(request, origin)) return json(origin, 403, { ok: false, error: "Forbidden." });

    const claimResponse = await rpc("claim_academy_notifications", { batch_size: 20 });
    const notifications = await claimResponse.json() as Notification[];
    let sent = 0;
    for (const notification of notifications) {
      if (await deliver(notification)) sent += 1;
    }
    return json(origin, 200, { ok: true, claimed: notifications.length, sent, failed: notifications.length - sent });
  } catch (error) {
    console.error(JSON.stringify({ event: "academy_notification_processing_failed", code: error instanceof Error ? error.message : "unexpected" }));
    return json(origin, 500, { ok: false, error: "Notification processing failed." });
  }
});
