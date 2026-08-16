import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createEmailJsRequest, renderAcademyEmail } from "./email.js";

const base = {
  id: "notification-id",
  idempotency_key: "academy:application-id:submitted:applicant",
  recipient_email: "applicant@example.com",
  payload: { applicantName: "Sam Test", programTitle: "Food Innovation" },
};

test("renders an applicant submission confirmation", () => {
  const email = renderAcademyEmail({ ...base, event_type: "application_submitted" }, "admin@example.com");
  assert.equal(email.to, "applicant@example.com");
  assert.match(email.subject, /Food Innovation/);
  assert.match(email.text, /received your application/);
  assert.equal(email.actionUrl, "https://grainmuse.net/pathfinder-academy/account");
});

test("routes new-application alerts to the configured administrator", () => {
  const email = renderAcademyEmail({
    ...base,
    event_type: "admin_new_application",
    recipient_email: null,
    payload: { ...base.payload, applicantEmail: "sam@example.com" },
  }, "academy@example.com");
  assert.equal(email.to, "academy@example.com");
  assert.equal(email.replyTo, "sam@example.com");
});

test("renders accepted status without exposing review notes", () => {
  const email = renderAcademyEmail({
    ...base,
    event_type: "application_status_changed",
    payload: { ...base.payload, status: "accepted", notes: "private" },
  }, "admin@example.com");
  assert.match(email.text, /has been accepted/);
  assert.doesNotMatch(email.text, /private/);
});

test("builds an authenticated EmailJS request with traceable outbox metadata", () => {
  const email = renderAcademyEmail({ ...base, event_type: "application_submitted" }, "admin@example.com");
  const request = createEmailJsRequest(base, email, {
    serviceId: "service_grainmuse",
    templateId: "template_academy",
    publicKey: "public-key",
    privateKey: "private-key",
    replyToEmail: "academy@example.com",
  });
  const body = JSON.parse(request.init.body);
  assert.equal(request.url, "https://api.emailjs.com/api/v1.0/email/send");
  assert.equal(body.service_id, "service_grainmuse");
  assert.equal(body.template_id, "template_academy");
  assert.equal(body.user_id, "public-key");
  assert.equal(body.accessToken, "private-key");
  assert.equal(body.template_params.to_email, "applicant@example.com");
  assert.equal(body.template_params.idempotency_key, base.idempotency_key);
  assert.equal(body.template_params.is_academy, true);
  assert.equal(body.template_params.is_contact_enquiry, false);
});

test("supports EmailJS accounts without private-key authorization", () => {
  const email = renderAcademyEmail({ ...base, event_type: "application_submitted" }, "admin@example.com");
  const request = createEmailJsRequest(base, email, {
    serviceId: "service_grainmuse",
    templateId: "template_academy",
    publicKey: "public-key",
    replyToEmail: "academy@example.com",
  });
  assert.equal("accessToken" in JSON.parse(request.init.body), false);
});

test("professional HTML template contains every supplied presentation variable", () => {
  const template = readFileSync(new URL("./emailjs-template.html", import.meta.url), "utf8");
  for (const variable of [
    "subject", "preheader", "eyebrow", "headline", "message",
    "action_url", "action_label",
  ]) {
    assert.match(template, new RegExp(`{{${variable}}}`));
  }
  assert.match(template, /role="presentation"/);
  assert.match(template, /@media only screen/);
  for (const mode of ["is_contact_confirmation", "is_academy"]) {
    assert.match(template, new RegExp(`{{#${mode}}}`));
    assert.match(template, new RegExp(`{{/${mode}}}`));
  }
});

test("rejects unsupported event types", () => {
  assert.throws(() => renderAcademyEmail({ ...base, event_type: "unknown" }, "admin@example.com"), /unsupported_notification_event/);
});
