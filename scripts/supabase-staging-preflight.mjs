/* eslint-env node */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;

function requireProjectRef(name, value) {
  const projectRef = value?.trim();
  if (!projectRef || !PROJECT_REF_PATTERN.test(projectRef)) {
    throw new Error(`${name} must be a 20-character Supabase project reference.`);
  }
  return projectRef;
}

export function validateStagingTarget({
  deployEnvironment,
  stagingProjectRef,
  productionProjectRef,
  linkedProjectRef,
}) {
  if (deployEnvironment?.trim().toLowerCase() !== "staging") {
    throw new Error("SUPABASE_DEPLOY_ENV must be exactly staging.");
  }

  const staging = requireProjectRef(
    "SUPABASE_STAGING_PROJECT_REF",
    stagingProjectRef,
  );
  const production = requireProjectRef(
    "SUPABASE_PRODUCTION_PROJECT_REF",
    productionProjectRef,
  );
  const linked = requireProjectRef("Linked project reference", linkedProjectRef);

  if (staging === production) {
    throw new Error("Staging and production project references must differ.");
  }
  if (linked !== staging) {
    throw new Error("The linked project does not match SUPABASE_STAGING_PROJECT_REF.");
  }

  return { staging, production };
}

function runSupabase(args) {
  const cliEntrypoint = resolve(
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  if (!existsSync(cliEntrypoint)) {
    throw new Error("The project-scoped Supabase CLI is not installed.");
  }

  const result = spawnSync(process.execPath, [cliEntrypoint, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
    shell: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Supabase command failed: ${args.join(" ")}`);
  }
}

export function main() {
  const linkedRefPath = resolve("supabase", ".temp", "project-ref");
  if (!existsSync(linkedRefPath)) {
    throw new Error(
      "No linked Supabase project. Login and link the staging project first.",
    );
  }

  const linkedProjectRef = readFileSync(linkedRefPath, "utf8").trim();
  const target = validateStagingTarget({
    deployEnvironment: process.env.SUPABASE_DEPLOY_ENV,
    stagingProjectRef: process.env.SUPABASE_STAGING_PROJECT_REF,
    productionProjectRef: process.env.SUPABASE_PRODUCTION_PROJECT_REF,
    linkedProjectRef,
  });

  console.log(`Verified staging target: ${target.staging}`);
  runSupabase(["migration", "list", "--linked"]);
  runSupabase(["db", "push", "--linked", "--dry-run"]);
  console.log("Staging preflight passed. No remote changes were applied.");
}

const isMain = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(`Staging preflight failed: ${error.message}`);
    process.exitCode = 1;
  }
}
