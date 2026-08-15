import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, preflightResponse } from "./cors.js";
import { sendContactNotification } from "./notification.js";

const MAX_BODY_BYTES = 12_000;
const IP_LIMIT = 5;
const EMAIL_LIMIT = 3;

import { validateContactPayload } from "./validation.js";

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function allowedOrigins(): Set<string> {
  return new Set(
    requiredEnv("ALLOWED_ORIGINS")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin),
  );
}

function jsonResponse(
  origin: string,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function failureCode(error: unknown): string {
  if (!(error instanceof Error)) return "unexpected";

  if (/^(rate_limit|submission_insert|notification_update)_\d{3}$/.test(error.message)) {
    return error.message;
  }

  if (error.message === "submission_insert_empty") return error.message;
  if (error.message === "RATE_LIMIT_SALT is too short") {
    return "configuration_invalid";
  }
  if (error.message.startsWith("Missing required environment variable:")) {
    return "configuration_missing";
  }

  return "unexpected";
}

function secretKey(): string {
  const currentKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (currentKeys) {
    const parsed = JSON.parse(currentKeys) as Record<string, string>;
    if (parsed.default) return parsed.default;
  }

  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function clientIp(request: Request): string {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: requiredEnv("TURNSTILE_SECRET_KEY"),
        response: token,
        remoteip: ip === "unknown" ? undefined : ip,
        idempotency_key: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) return false;

  const result = await response.json() as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  const expectedHostnames = new Set(
    requiredEnv("TURNSTILE_EXPECTED_HOSTNAMES")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );

  return Boolean(
    result.success &&
      result.hostname &&
      expectedHostnames.has(result.hostname.toLowerCase()) &&
      (!result.action || result.action === "contact"),
  );
}

async function restRequest(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const key = secretKey();
  return fetch(`${requiredEnv("SUPABASE_URL")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });
}

async function consumeRateLimit(
  identifierHash: string,
  limit: number,
): Promise<boolean> {
  const response = await restRequest("rpc/consume_contact_rate_limit", {
    method: "POST",
    body: JSON.stringify({
      p_identifier_hash: identifierHash,
      p_limit: limit,
    }),
  });

  if (!response.ok) throw new Error(`rate_limit_${response.status}`);
  return await response.json() as boolean;
}

async function insertSubmission(value: {
  name: string;
  email: string;
  phone: string | null;
  type: string;
  message: string;
}): Promise<string> {
  const response = await restRequest("contact_submissions?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: value.name,
      email: value.email,
      phone: value.phone,
      enquiry_type: value.type,
      message: value.message,
      source: "website",
    }),
  });

  if (!response.ok) throw new Error(`submission_insert_${response.status}`);
  const rows = await response.json() as Array<{ id: string }>;
  if (!rows[0]?.id) throw new Error("submission_insert_empty");
  return rows[0].id;
}

async function updateNotificationStatus(
  submissionId: string,
  status: "sent" | "failed",
): Promise<void> {
  const now = new Date().toISOString();
  const response = await restRequest(`contact_submissions?id=eq.${submissionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      notification_status: status,
      notification_attempted_at: now,
      notification_sent_at: status === "sent" ? now : null,
    }),
  });

  if (!response.ok) throw new Error(`notification_update_${response.status}`);
}

async function sendNotification(
  submissionId: string,
  value: {
    name: string;
    email: string;
    phone: string | null;
    type: string;
    message: string;
  },
): Promise<boolean> {
  try {
    const provider = Deno.env.get("CONTACT_EMAIL_PROVIDER")?.trim().toLowerCase() ||
      "resend";
    const toEmail = requiredEnv("CONTACT_TO_EMAIL");
    const config = provider === "emailjs"
      ? {
        serviceId: requiredEnv("VITE_EMAILJS_SERVICE_ID"),
        templateId: requiredEnv("VITE_EMAILJS_TEMPLATE_ID"),
        publicKey: requiredEnv("VITE_EMAILJS_PUBLIC_KEY"),
        privateKey: Deno.env.get("EMAILJS_PRIVATE_KEY")?.trim() || undefined,
        toEmail,
      }
      : {
        apiKey: requiredEnv("RESEND_API_KEY"),
        fromEmail: requiredEnv("CONTACT_FROM_EMAIL"),
        toEmail,
      };

    return await sendContactNotification({
      provider,
      config,
      submissionId,
      value,
    });
  } catch {
    return false;
  }
}

Deno.serve(async (request: Request) => {
  const requestId = crypto.randomUUID();
  let origin = "";

  try {
    origin = request.headers.get("origin") ?? "";
    if (!origin || !allowedOrigins().has(origin)) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden." }), {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (request.method === "OPTIONS") {
      return preflightResponse(origin);
    }

    if (request.method !== "POST") {
      return jsonResponse(origin, 405, { ok: false, error: "Method not allowed." });
    }

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse(origin, 415, { ok: false, error: "JSON content required." });
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse(origin, 413, { ok: false, error: "Request too large." });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(origin, 413, { ok: false, error: "Request too large." });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse(origin, 400, { ok: false, error: "Invalid JSON." });
    }

    const validation = validateContactPayload(payload);
    if (!validation.ok) {
      return jsonResponse(origin, 400, { ok: false, error: validation.error });
    }

    const ip = clientIp(request);
    if (!await verifyTurnstile(validation.value.turnstileToken, ip)) {
      return jsonResponse(origin, 400, {
        ok: false,
        error: "Security verification failed. Please try again.",
      });
    }

    const salt = requiredEnv("RATE_LIMIT_SALT");
    if (salt.length < 32) throw new Error("RATE_LIMIT_SALT is too short");

    const [ipHash, emailHash] = await Promise.all([
      sha256(`${salt}:ip:${ip}`),
      sha256(`${salt}:email:${validation.value.email}`),
    ]);
    const ipAllowed = await consumeRateLimit(ipHash, IP_LIMIT);
    const emailAllowed = await consumeRateLimit(emailHash, EMAIL_LIMIT);

    if (!ipAllowed || !emailAllowed) {
      return jsonResponse(origin, 429, {
        ok: false,
        error: "Too many requests. Please wait before trying again.",
      });
    }

    const submissionId = await insertSubmission(validation.value);
    const notificationSent = await sendNotification(submissionId, validation.value);

    try {
      await updateNotificationStatus(
        submissionId,
        notificationSent ? "sent" : "failed",
      );
    } catch {
      console.error(JSON.stringify({ event: "notification_status_failed", requestId }));
    }

    if (!notificationSent) {
      console.error(JSON.stringify({ event: "notification_delivery_failed", requestId }));
    }

    return jsonResponse(origin, 202, {
      ok: true,
      requestId,
      notificationSent,
    });
  } catch (error) {
    console.error(JSON.stringify({
      event: "contact_submission_failed",
      requestId,
      failureCode: failureCode(error),
    }));
    return origin
      ? jsonResponse(origin, 500, {
          ok: false,
          error: "We could not process your request. Please try again later.",
          requestId,
        })
      : new Response(JSON.stringify({ ok: false, error: "Request failed." }), {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
          },
        });
  }
});
