/* eslint-env node */
import { createClient } from "@supabase/supabase-js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(["editor", "admin"]);

function send(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export function readBearer(request) {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export function requireEnvironment() {
  const values = {
    url: process.env.VITE_SUPABASE_URL,
    publishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    redirectTo: process.env.ADMIN_INVITE_REDIRECT_URL,
  };
  if (Object.values(values).some((value) => !value)) {
    throw new Error("Administrator invitation environment is incomplete.");
  }
  return values;
}

export function createInvitationHandler({
  createClientImpl = createClient,
  environmentLoader = requireEnvironment,
} = {}) {
  return async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Method not allowed." });
  }

  let env;
  try {
    env = environmentLoader();
  } catch {
    return send(response, 503, { error: "Invitations are not configured." });
  }

  const configuredOrigin = new URL(env.redirectTo).origin;
  if (request.headers.origin && request.headers.origin !== configuredOrigin) {
    return send(response, 403, { error: "Request origin is not allowed." });
  }

  const token = readBearer(request);
  if (!token) return send(response, 401, { error: "Authentication required." });

  const email = request.body?.email?.trim().toLowerCase();
  const role = request.body?.role;
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return send(response, 400, { error: "Enter a valid email address." });
  }
  if (!ALLOWED_ROLES.has(role)) {
    return send(response, 400, { error: "Select a valid staff role." });
  }

  const userClient = createClientImpl(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const [{ data: userData, error: userError }, { data: allowed, error: roleError }] =
    await Promise.all([
      userClient.auth.getUser(token),
      userClient.rpc("is_active_admin"),
    ]);
  if (userError || !userData.user || roleError || allowed !== true) {
    return send(response, 403, { error: "Administrator access required." });
  }

  const adminClient = createClientImpl(env.url, env.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: invitation, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: env.redirectTo,
      data: { invited_role: role },
    });
  if (inviteError) {
    const duplicate = /already|registered|exists/i.test(inviteError.message);
    return send(response, duplicate ? 409 : 502, {
      error: duplicate
        ? "That email already belongs to an account."
        : "The invitation could not be sent. Try again shortly.",
    });
  }

  const { error: membershipError } = await adminClient.rpc(
    "provision_admin_user",
    { target_user_id: invitation.user.id, target_role: role },
  );
  if (membershipError) {
    await adminClient.auth.admin.deleteUser(invitation.user.id);
    return send(response, 500, {
      error: "The invitation could not be provisioned safely.",
    });
  }

  return send(response, 201, {
    invitation: { email, role, userId: invitation.user.id },
  });
  };
}

export default createInvitationHandler();
