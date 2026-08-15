/* eslint-env node */
import assert from "node:assert/strict";
import test from "node:test";
import { createInvitationHandler, readBearer } from "./invitations.js";

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

function clients({ allowed = true, inviteError = null, membershipError = null } = {}) {
  let deletedUser = null;
  const userClient = {
    auth: { getUser: async () => ({ data: { user: { id: "admin-id" } }, error: null }) },
    rpc: async () => ({ data: allowed, error: null }),
  };
  const adminClient = {
    auth: { admin: {
      inviteUserByEmail: async () => ({
        data: { user: { id: "invited-id" } }, error: inviteError,
      }),
      deleteUser: async (id) => { deletedUser = id; return { error: null }; },
    } },
    rpc: async () => ({ data: null, error: membershipError }),
  };
  let calls = 0;
  return {
    createClientImpl: () => (calls++ === 0 ? userClient : adminClient),
    deleted: () => deletedUser,
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

test("invites and provisions an authorized staff member", async () => {
  const { response } = await invoke();
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body.invitation, {
    email: "new.staff@example.com", role: "editor", userId: "invited-id",
  });
});

test("rolls back the Auth user when membership provisioning fails", async () => {
  const { response, mock } = await invoke({ membershipError: { message: "failed" } });
  assert.equal(response.statusCode, 500);
  assert.equal(mock.deleted(), "invited-id");
});
