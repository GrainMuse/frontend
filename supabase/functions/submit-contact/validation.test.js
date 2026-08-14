import assert from "node:assert/strict";
import test from "node:test";
import { validateContactPayload } from "./validation.js";

const validPayload = {
  name: "Asha Perera",
  email: "ASHA@example.com",
  phone: "+94 71 234 5678",
  type: "Wholesale / Trade",
  message: "I would like to discuss a wholesale order.",
  turnstileToken: "test-token",
};

test("normalizes and accepts a valid contact payload", () => {
  const result = validateContactPayload(validPayload);
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "asha@example.com");
});

test("rejects the removed honeypot field", () => {
  const result = validateContactPayload({ ...validPayload, website: "spam.example" });
  assert.deepEqual(result, { ok: false, error: "Invalid request." });
});

test("rejects unexpected fields", () => {
  const result = validateContactPayload({ ...validPayload, role: "admin" });
  assert.equal(result.ok, false);
});

test("rejects invalid enquiry types", () => {
  const result = validateContactPayload({ ...validPayload, type: "Injected" });
  assert.equal(result.ok, false);
});

test("requires a Turnstile token", () => {
  const result = validateContactPayload({ ...validPayload, turnstileToken: "" });
  assert.equal(result.ok, false);
});

test("rejects oversized messages", () => {
  const result = validateContactPayload({
    ...validPayload,
    message: "x".repeat(4001),
  });
  assert.equal(result.ok, false);
});
