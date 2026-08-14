/* eslint-env node */

import assert from "node:assert/strict";
import test from "node:test";
import { validateStagingTarget } from "./supabase-staging-preflight.mjs";

const validConfig = {
  deployEnvironment: "staging",
  stagingProjectRef: "abcdefghijklmnopqrst",
  productionProjectRef: "tsrqponmlkjihgfedcba",
  linkedProjectRef: "abcdefghijklmnopqrst",
};

test("accepts an explicitly matched staging target", () => {
  assert.deepEqual(validateStagingTarget(validConfig), {
    staging: validConfig.stagingProjectRef,
    production: validConfig.productionProjectRef,
  });
});

test("rejects a non-staging deployment environment", () => {
  assert.throws(
    () => validateStagingTarget({ ...validConfig, deployEnvironment: "production" }),
    /must be exactly staging/,
  );
});

test("rejects matching staging and production targets", () => {
  assert.throws(
    () => validateStagingTarget({
      ...validConfig,
      productionProjectRef: validConfig.stagingProjectRef,
    }),
    /must differ/,
  );
});

test("rejects a linked project that differs from staging", () => {
  assert.throws(
    () => validateStagingTarget({
      ...validConfig,
      linkedProjectRef: validConfig.productionProjectRef,
    }),
    /does not match/,
  );
});

test("rejects malformed project references", () => {
  assert.throws(
    () => validateStagingTarget({ ...validConfig, stagingProjectRef: "not-a-ref" }),
    /20-character/,
  );
});
