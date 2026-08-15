/* eslint-env node */
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import * as OTPAuth from "otpauth";
import postgres from "postgres";

function cleanEnv(value) {
  if (!value) return value;
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

const apiUrl = cleanEnv(process.env.API_URL) ?? "http://127.0.0.1:54321";
const adminKey = cleanEnv(
  process.env.SECRET_KEY ?? process.env.SERVICE_ROLE_KEY,
);
const databaseUrl = cleanEnv(process.env.DB_URL);
const runId = Date.now().toString(36);
const adminEmail = `admin-e2e-${runId}@grainmuse.local`;
const editorEmail = `editor-e2e-${runId}@grainmuse.local`;
const outsiderEmail = `outsider-e2e-${runId}@grainmuse.local`;
const invitedEmail = `invited-e2e-${runId}@grainmuse.local`;
const password = `Admin-${runId}-Pass!7`;
const createdUsers = [];
const sql = databaseUrl ? postgres(databaseUrl, { max: 1 }) : null;

async function adminRequest(request, method, path, data) {
  if (!adminKey) throw new Error("SECRET_KEY or SERVICE_ROLE_KEY is required");
  return request.fetch(`${apiUrl}${path}`, {
    method,
    data,
    headers: { apikey: adminKey, Authorization: `Bearer ${adminKey}` },
  });
}

async function createUser(request, email, membership) {
  const response = await adminRequest(request, "POST", "/auth/v1/admin/users", {
    email, password, email_confirm: true,
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  const user = await response.json();
  createdUsers.push(user.id);
  if (membership) {
    if (!sql) throw new Error("DB_URL is required for trusted membership provisioning");
    await sql`insert into public.admin_users (user_id, role, active)
      values (${user.id}, ${membership}, true)`;
  }
  return user;
}

function currentCode(secret) {
  return new OTPAuth.TOTP({ secret, digits: 6, period: 30 }).generate();
}

async function signIn(page, email) {
  await page.goto("/admin");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
}

async function enrollMfa(page) {
  await expect(page.getByRole("heading", { name: "Secure your account" })).toBeVisible();
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("code").textContent()).trim();
  await page.getByLabel("Authenticator code").fill(currentCode(secret));
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  return secret;
}

test.describe.serial("admin portal", () => {
  let totpSecret;
  let invitationLink;

  test.beforeAll(async ({ request }) => {
    await createUser(request, adminEmail, "admin");
    await createUser(request, editorEmail, "editor");
    await createUser(request, outsiderEmail, null);
    const authAdmin = createClient(apiUrl, adminKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: generated, error: generateError } =
      await authAdmin.auth.admin.generateLink({
        type: "invite",
        email: invitedEmail,
        options: {
          redirectTo: "http://127.0.0.1:4173/admin/accept-invite",
        },
      });
    expect(generateError).toBeNull();
    invitationLink = generated.properties.action_link;
    createdUsers.push(generated.user.id);
    await sql`insert into public.admin_users (user_id, role, active)
      values (${generated.user.id}, 'editor', true)`;
    await sql`insert into public.contact_submissions
      (name, email, message, enquiry_type, source)
      values (
        'E2E Buyer', ${`buyer-${runId}@example.test`},
        'Please send wholesale information for the automated portal test.',
        'Wholesale', 'e2e'
      )`;
  });

  test("rejects invalid credentials without revealing account details", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Email address").fill(adminEmail);
    await page.getByLabel("Password").fill("incorrect-password");
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await expect(page.getByRole("alert")).toHaveText(
      "Sign-in failed. Check your credentials and try again.",
    );
  });

  test.afterAll(async ({ request }) => {
    if (sql) {
      await sql`delete from public.products where slug like 'e2e-product-%'`;
      await sql`delete from public.product_categories where slug like 'e2e-category-%'`;
      await sql`delete from public.team_members where slug like 'e2e-member-%'`;
      await sql`delete from public.site_content where key like 'e2e_content_%'`;
      await sql`delete from public.contact_submissions where source = 'e2e'`;
    }
    for (const id of createdUsers) {
      await adminRequest(request, "DELETE", `/auth/v1/admin/users/${id}`, null);
    }
    if (sql) await sql.end();
  });

  test("rejects valid credentials without active membership", async ({ page }) => {
    await signIn(page, outsiderEmail);
    await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
    await expect(page.getByText("not an active Grain Muse staff member")).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
  });

  test("accepts an invitation, establishes a password, and continues to MFA", async ({ page }) => {
    await page.goto(invitationLink);
    await expect(page.getByRole("heading", { name: "Create your password." })).toBeVisible();
    await page.getByLabel("New password").fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Continue to authenticator setup" }).click();
    await expect(page.getByRole("heading", { name: "Secure your account" })).toBeVisible();
  });

  test("enrolls TOTP and completes category, product, team and content CRUD", async ({ page }) => {
    await signIn(page, adminEmail);
    totpSecret = await enrollMfa(page);

    await page.getByRole("button", { name: "Categories" }).click();
    await page.getByRole("button", { name: "Add record" }).click();
    await page.getByLabel("Name").fill(`E2E Category ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-category-${runId}`);
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByText(`E2E Category ${runId}`)).toBeVisible();

    await page.getByRole("button", { name: "Products" }).click();
    await page.getByRole("button", { name: "Add record" }).click();
    await page.getByLabel("Name").fill(`E2E Product ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-product-${runId}`);
    await page.getByLabel("Category").selectOption({ label: `E2E Category ${runId}` });
    await page.getByLabel("Description").fill("Created by the automated admin workflow test.");
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByText(`E2E Product ${runId}`)).toBeVisible();
    const productRow = page.getByTestId("record-row").filter({ hasText: `E2E Product ${runId}` });
    await productRow.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Subtitle").fill("Updated safely");
    await page.getByRole("button", { name: "Save record" }).click();

    await page.getByRole("button", { name: "Team" }).click();
    await page.getByRole("button", { name: "Add member" }).click();
    await page.getByLabel("Name").fill(`E2E Member ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-member-${runId}`);
    await page.getByLabel("Position").fill("Test Steward");
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByText(`E2E Member ${runId}`)).toBeVisible();

    await page.getByRole("button", { name: "Site content" }).click();
    await page.getByRole("button", { name: "Add record" }).click();
    await page.getByLabel("Content key").fill(`e2e_content_${runId}`);
    await page.getByLabel("JSON value").fill('{"enabled":true,"scope":"e2e"}');
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByText(`e2e_content_${runId}`)).toBeVisible();

    await page.route("**/api/admin/invitations", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ invitation: {
          email: "new.staff@example.com", role: "editor", userId: "mock-id",
        } }),
      }),
    );
    await page.getByRole("button", { name: "Staff access" }).click();
    await page.getByLabel("Email address").fill("new.staff@example.com");
    await page.getByLabel("Role").selectOption("editor");
    await page.getByRole("button", { name: "Send secure invitation" }).click();
    await expect(page.getByText("Invitation sent to new.staff@example.com.")).toBeVisible();

    for (const [section, name] of [["Site content", `e2e_content_${runId}`], ["Team", `E2E Member ${runId}`], ["Products", `E2E Product ${runId}`], ["Categories", `E2E Category ${runId}`]]) {
      await page.getByRole("button", { name: section }).click();
      const row = page.getByTestId("record-row").filter({ hasText: name });
      page.once("dialog", (dialog) => dialog.accept());
      await row.getByRole("button", { name: "Delete" }).click();
      await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    }
  });

  test("allows editors to manage content but hides administrator enquiries", async ({ page }) => {
    await signIn(page, editorEmail);
    await enrollMfa(page);
    await expect(page.getByRole("button", { name: "Enquiries" })).toHaveCount(0);
    await page.getByRole("button", { name: "Categories" }).click();
    await page.getByRole("button", { name: "Add record" }).click();
    await page.getByLabel("Name").fill(`Editor Category ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-category-editor-${runId}`);
    await page.getByRole("button", { name: "Save record" }).click();
    const row = page.getByTestId("record-row").filter({ hasText: `Editor Category ${runId}` });
    await expect(row).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
  });

  test("triages enquiries and requires TOTP on the next login", async ({ page }) => {
    await signIn(page, adminEmail);
    await expect(page.getByRole("heading", { name: "Verify it’s you" })).toBeVisible();
    await page.getByLabel("Authenticator code").fill("000000");
    await page.getByRole("button", { name: "Verify code" }).click();
    await expect(page.getByText("verification code was not accepted")).toBeVisible();
    await page.getByLabel("Authenticator code").fill(currentCode(totpSecret));
    await page.getByRole("button", { name: "Verify code" }).click();
    await page.getByRole("button", { name: "Enquiries" }).click();
    const card = page.getByTestId("enquiry-card").filter({ hasText: `buyer-${runId}@example.test` });
    await expect(card).toBeVisible();
    await card.locator("select").selectOption("resolved");
    await expect(card.locator("select")).toHaveValue("resolved");
  });
});
