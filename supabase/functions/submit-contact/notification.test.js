import assert from "node:assert/strict";
import test from "node:test";
import {
  createNotificationRequest,
  sendContactNotification,
} from "./notification.js";

const value = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: null,
  type: "Wholesale",
  message: "Please send your current catalogue.",
};

test("builds an authenticated EmailJS notification request", () => {
  const request = createNotificationRequest({
    provider: "emailjs",
    submissionId: "submission-id",
    value,
    config: {
      serviceId: "service_grainmuse",
      templateId: "template_contact",
      publicKey: "public-key",
      privateKey: "private-key",
      toEmail: "trade@grainmuse.net",
    },
  });
  const body = JSON.parse(request.init.body);

  assert.equal(request.url, "https://api.emailjs.com/api/v1.0/email/send");
  assert.equal(body.service_id, "service_grainmuse");
  assert.equal(body.template_id, "template_contact");
  assert.equal(body.user_id, "public-key");
  assert.equal(body.accessToken, "private-key");
  assert.equal(body.template_params.email, value.email);
  assert.equal(body.template_params.reply_to, value.email);
  assert.equal(body.template_params.to_email, "trade@grainmuse.net");
  assert.equal(body.template_params.is_contact_enquiry, true);
  assert.equal(body.template_params.is_contact_confirmation, true);
  assert.equal(body.template_params.is_academy, false);
  assert.doesNotMatch(request.init.body, /turnstile/i);
});

test("supports EmailJS accounts that do not require private-key authorization", () => {
  const request = createNotificationRequest({
    provider: "emailjs",
    submissionId: "submission-id",
    value,
    config: {
      serviceId: "service_grainmuse",
      templateId: "template_contact",
      publicKey: "public-key",
      toEmail: "trade@grainmuse.net",
    },
  });

  assert.equal("accessToken" in JSON.parse(request.init.body), false);
});

test("reports provider delivery failures without losing the stored enquiry", async () => {
  const delivered = await sendContactNotification({
    provider: "emailjs",
    submissionId: "submission-id",
    value,
    config: {
      serviceId: "service_grainmuse",
      templateId: "template_contact",
      publicKey: "public-key",
      toEmail: "trade@grainmuse.net",
    },
    fetchImpl: async () => new Response("Forbidden", { status: 403 }),
    signal: undefined,
  });

  assert.deepEqual(delivered, { ok: false, status: 403 });
});

test("rejects Resend because EmailJS is the only notification provider", () => {
  assert.throws(
    () => createNotificationRequest({ provider: "resend", config: {}, value }),
    /Unsupported contact email provider/,
  );
});
