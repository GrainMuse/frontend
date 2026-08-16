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
const applicantEmail = `applicant-e2e-${runId}@grainmuse.local`;
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
    await createUser(request, applicantEmail, null);
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
    await sql`insert into private.admin_invitations
      (auth_user_id, email, role, status, invited_by, expires_at)
      values (
        ${generated.user.id}, ${invitedEmail}, 'editor', 'pending',
        ${createdUsers[0]}, now() + interval '1 hour'
      )`;
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
      await sql`delete from public.academy_applications where email = ${applicantEmail}`;
      await sql`delete from public.academy_programs where slug like 'e2e-academy-%'`;
      await sql`delete from public.academy_resource_persons where slug like 'e2e-resource-%'`;
      await sql`delete from public.contact_submissions where source = 'e2e'`;
      await sql`delete from private.admin_invitations where email = ${invitedEmail}`;
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

    await page.getByRole("button", { name: "PATHFINDER Academy" }).click();
    await page.getByRole("button", { name: /Resource persons/ }).click();
    await page.getByRole("button", { name: "Add person" }).click();
    await page.getByLabel("Name").fill(`E2E Resource ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-resource-${runId}`);
    await page.getByLabel("Professional title").fill("Learning Facilitator");
    await page.getByLabel("Short biography").fill("An experienced facilitator created for the academy browser test.");
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("academy-record-row").filter({ hasText: `E2E Resource ${runId}` })).toBeVisible();

    await page.getByRole("button", { name: /Programs/ }).click();
    await page.getByRole("button", { name: "Add program" }).click();
    await page.getByLabel("Title", { exact: true }).fill(`E2E Academy ${runId}`);
    await page.getByLabel("Slug").fill(`e2e-academy-${runId}`);
    await page.getByLabel("Summary").fill("A secure end-to-end academy program.");
    await page.getByLabel("Description", { exact: true }).fill("This program verifies public academy content and the authenticated internal application journey.");
    await page.getByLabel("External application URL").fill("https://example.com/pathfinder-application");
    await page.getByLabel(new RegExp(`E2E Resource ${runId}`)).check();
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByTestId("academy-record-row").filter({ hasText: `E2E Academy ${runId}` })).toBeVisible();

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

  test("renders a published academy program and accepts a signed-in internal application", async ({ page }) => {
    await page.goto("/pathfinder-academy");
    await expect(page.getByRole("heading", { name: "Academy resource persons" })).toBeVisible();
    const academyPersonCard = page.locator("article").filter({
      hasText: `E2E Resource ${runId}`,
    });
    await expect(academyPersonCard).toBeVisible();
    await expect(academyPersonCard.getByRole("link", { name: /View profile/ })).toHaveAttribute(
      "href",
      `/pathfinder-academy/resource-persons/e2e-resource-${runId}`,
    );

    await page.goto(`/pathfinder-academy/resource-persons/e2e-resource-${runId}`);
    await expect(page.getByRole("heading", { name: `E2E Resource ${runId}`, exact: true })).toBeVisible();
    const personSchema = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    expect(personSchema["@type"]).toBe("Person");
    expect(personSchema.name).toBe(`E2E Resource ${runId}`);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "profile");

    await page.goto(`/pathfinder-academy/programs/e2e-academy-${runId}`);
    await expect(page.getByRole("heading", { name: `E2E Academy ${runId}`, exact: true })).toBeVisible();
    await expect(page.getByText(`E2E Resource ${runId}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open external form/ })).toHaveAttribute("href", "https://example.com/pathfinder-application");
    const courseSchema = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    expect(courseSchema["@type"]).toBe("Course");
    expect(courseSchema.provider.name).toBe("PATHFINDER Academy");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://grainmuse.net/pathfinder-academy/programs/e2e-academy-${runId}`,
    );

    await page.getByLabel("Email").fill(applicantEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Internal application" })).toBeVisible();
    await page.getByLabel("Full name").fill("E2E Academy Applicant");
    await page.getByLabel("Why do you want to join?").fill("I want to verify the complete secure internal application workflow.");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByText("Your application has been submitted successfully.")).toBeVisible();
    await page.getByRole("link", { name: "View my applications" }).click();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    const myApplication = page.locator("article").filter({ hasText: `E2E Academy ${runId}` });
    await expect(myApplication).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await myApplication.getByRole("button", { name: "Withdraw application" }).click();
    await expect(myApplication.getByText("withdrawn", { exact: true })).toBeVisible();
  });

  test("triages enquiries and requires TOTP on the next login", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page, adminEmail);
    await expect(page.getByRole("heading", { name: "Verify it’s you" })).toBeVisible();
    await page.getByLabel("Authenticator code").fill("000000");
    await page.getByRole("button", { name: "Verify code" }).click();
    await expect(page.getByText("verification code was not accepted")).toBeVisible();
    await page.getByLabel("Authenticator code").fill(currentCode(totpSecret));
    await page.getByRole("button", { name: "Verify code" }).click();
    await page.getByRole("button", { name: "PATHFINDER Academy" }).click();
    await page.getByRole("button", { name: /Applications/ }).click();
    const application = page.locator("article").filter({ hasText: applicantEmail });
    await expect(application).toBeVisible();
    await application.locator("select").selectOption("reviewing");
    await expect(application.locator("select")).toHaveValue("reviewing");
    await application.getByRole("button", { name: "Review" }).click();
    await page.getByLabel("Decision status").selectOption("shortlisted");
    await page.getByLabel("Private review notes").fill("Strong motivation. Verify availability before the final decision.");
    await page.getByRole("button", { name: "Save review" }).click();
    await expect(page.getByText("Application review saved.")).toBeVisible();
    await page.getByLabel("Filter by application status").selectOption("shortlisted");
    await expect(application).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^pathfinder-applications-\d{4}-\d{2}-\d{2}\.csv$/);
    await page.getByRole("button", { name: /Email delivery/ }).click();
    const notificationRows = page.getByTestId("academy-notification-row");
    await expect(notificationRows.filter({ hasText: "application submitted" })).toBeVisible();
    await expect(notificationRows.filter({ hasText: "admin new application" })).toBeVisible();
    await expect(notificationRows.filter({ hasText: "application withdrawn" })).toBeVisible();
    await expect(notificationRows.filter({ hasText: "application status changed" })).toBeVisible();
    await page.getByRole("button", { name: "Enquiries" }).click();
    const card = page.getByTestId("enquiry-card").filter({ hasText: `buyer-${runId}@example.test` });
    await expect(card).toBeVisible();
    await card.locator("select").selectOption("resolved");
    await expect(card.locator("select")).toHaveValue("resolved");

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileMenu = page.getByRole("button", { name: "Open admin navigation" });
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.click();
    const mobileNavigation = page.locator("#admin-navigation");
    await expect(mobileNavigation).toBeVisible();
    await expect(page.getByRole("button", { name: "Close admin navigation" }).first()).toBeVisible();
    await mobileNavigation.getByRole("button", { name: "Products" }).click();
    await expect(mobileNavigation).toBeHidden();
    await page.getByRole("button", { name: "Add record" }).click();
    const mobileDrawer = page.locator("form").filter({
      has: page.getByRole("heading", { name: "product", exact: true }),
    });
    const drawerBounds = await mobileDrawer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    });
    expect(drawerBounds.left).toBe(0);
    expect(drawerBounds.right).toBeLessThanOrEqual(390);
    expect(drawerBounds.width).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
  });
});
