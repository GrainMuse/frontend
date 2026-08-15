/* eslint-env node */
import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyInviteError,
  createInvitationHandler,
  isReplaceablePendingInvite,
  readBearer,
} from "./invitations.js";

const env = {
  url: "https://project.supabase.co",
  publishableKey: "publishable",
  secretKey: "secret",
  redirectTo: "https://grainmuse.example/admin/accept-invite",
};

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    status(value) { this.statusCode = value; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    end(value) { this.body = JSON.parse(value); },
  };
}

function request(overrides = {}) {
  return {
    method: "POST",
    headers: {
      origin: "https://grainmuse.example",
      authorization: "Bearer valid-admin-token",
    },
    body: { email: "new.staff@example.com", role: "editor" },
    ...overrides,
  };
}

function clients({
  allowed = true,
  inviteError = null,
  membershipError = null,
  existingUser = null,
  listUsersError = null,
  deleteError = null,
} = {}) {
  let deletedUser = null;
  let inviteCalls = 0;
  const userClient = {
    auth: { getUser: async () => ({ data: { user: { id: "admin-id" } }, error: null }) },
    rpc: async () => ({ data: allowed, error: null }),
  };
  const adminClient = {
    auth: { admin: {
      inviteUserByEmail: async () => {
        inviteCalls += 1;
        return inviteCalls === 1 && inviteError
          ? { data: { user: null }, error: inviteError }
          : { data: { user: { id: "invited-id" } }, error: null };
      },
      listUsers: async () => ({
        data: { users: existingUser ? [existingUser] : [] },
        error: listUsersError,
      }),
      deleteUser: async (id) => {
        deletedUser = id;
        return { error: deleteError };
      },
    } },
    rpc: async () => ({ data: null, error: membershipError }),
  };
  let calls = 0;
  return {
    createClientImpl: () => (calls++ === 0 ? userClient : adminClient),
    deleted: () => deletedUser,
    inviteCalls: () => inviteCalls,
  };
}

async function invoke(options = {}, requestOverrides = {}) {
  const mock = clients(options);
  const handler = createInvitationHandler({
    createClientImpl: mock.createClientImpl,
    environmentLoader: () => env,
  });
  const response = responseRecorder();
  await handler(request(requestOverrides), response);
  return { response, mock };
}

test("extracts only a valid bearer token", () => {
  assert.equal(readBearer({ headers: { authorization: "Bearer abc" } }), "abc");
  assert.equal(readBearer({ headers: { authorization: "Basic abc" } }), "");
});

test("rejects cross-origin invitation requests", async () => {
  const { response } = await invoke({}, { headers: {
    origin: "https://attacker.example", authorization: "Bearer token",
  } });
  assert.equal(response.statusCode, 403);
});

test("validates the invited email and role", async () => {
  const invalidEmail = await invoke({}, { body: { email: "bad", role: "editor" } });
  assert.equal(invalidEmail.response.statusCode, 400);
  const invalidRole = await invoke({}, { body: { email: "ok@example.com", role: "owner" } });
  assert.equal(invalidRole.response.statusCode, 400);
});

test("requires an MFA-backed active administrator", async () => {
  const { response } = await invoke({ allowed: false });
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Administrator access required.");
});

test("classifies common Supabase invitation failures safely", () => {
  assert.equal(
    classifyInviteError({ status: 429, message: "email rate limit exceeded" }).code,
    "EMAIL_RATE_LIMITED",
  );
  assert.equal(
    classifyInviteError({ code: "user_already_exists" }).code,
    "ACCOUNT_EXISTS",
  );
  assert.equal(
    classifyInviteError({ message: "redirect URL is not allowed" }).code,
    "INVITE_REDIRECT_INVALID",
  );
  assert.equal(
    classifyInviteError({ message: "SMTP delivery failed" }).code,
    "EMAIL_DELIVERY_FAILED",
  );
});

test("only replaces an unaccepted user created by the invitation flow", () => {
  assert.equal(isReplaceablePendingInvite({
    id: "pending-id",
    invited_at: "2026-08-15T10:00:00Z",
  }), true);
  assert.equal(isReplaceablePendingInvite({
    id: "confirmed-id",
    invited_at: "2026-08-15T10:00:00Z",
    email_confirmed_at: "2026-08-15T10:05:00Z",
  }), false);
  assert.equal(isReplaceablePendingInvite({
    id: "signup-id",
    created_at: "2026-08-15T10:00:00Z",
  }), false);
});

test("invites and provisions an authorized staff member", async () => {
  const { response } = await invoke();
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body.invitation, {
    email: "new.staff@example.com",
    role: "editor",
    userId: "invited-id",
    reissued: false,
  });
});

test("replaces an expired pending invitation and sends a fresh one", async () => {
  const { response, mock } = await invoke({
    inviteError: { code: "user_already_exists" },
    existingUser: {
      id: "stale-invite-id",
      email: "new.staff@example.com",
      invited_at: "2026-08-15T10:00:00Z",
      email_confirmed_at: null,
      confirmed_at: null,
      last_sign_in_at: null,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(mock.deleted(), "stale-invite-id");
  assert.equal(mock.inviteCalls(), 2);
  assert.deepEqual(response.body.invitation, {
    email: "new.staff@example.com",
    role: "editor",
    userId: "invited-id",
    reissued: true,
  });
});

test("never replaces a confirmed existing account", async () => {
  const { response, mock } = await invoke({
    inviteError: { code: "user_already_exists" },
    existingUser: {
      id: "confirmed-id",
      email: "new.staff@example.com",
      invited_at: "2026-08-15T10:00:00Z",
      email_confirmed_at: "2026-08-15T10:05:00Z",
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.code, "ACCOUNT_EXISTS");
  assert.equal(mock.deleted(), null);
  assert.equal(mock.inviteCalls(), 1);
});

test("does not delete a pending invitation when user lookup fails", async () => {
  const { response, mock } = await invoke({
    inviteError: { code: "user_already_exists" },
    listUsersError: { code: "lookup_failed", status: 500 },
  });

  assert.equal(response.statusCode, 502);
  assert.equal(response.body.code, "INVITATION_LOOKUP_FAILED");
  assert.equal(mock.deleted(), null);
});

test("rolls back the Auth user when membership provisioning fails", async () => {
  const { response, mock } = await invoke({ membershipError: { message: "failed" } });
  assert.equal(response.statusCode, 500);
  assert.equal(mock.deleted(), "invited-id");
});
