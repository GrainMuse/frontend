import assert from "node:assert/strict";
import test from "node:test";
import {
  createConfirmationRequest,
  createNotificationRequest,
  sendContactConfirmation,
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
  assert.equal(body.template_params.reply_to, value.email);
  assert.equal(body.template_params.to_email, "trade@grainmuse.net");
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

test("builds an EmailJS auto-reply addressed to the visitor", () => {
  const request = createConfirmationRequest({
    value,
    config: {
      serviceId: "service_grainmuse",
      autoreplyTemplateId: "template_autoreply",
      publicKey: "public-key",
      privateKey: "private-key",
      toEmail: "trade@grainmuse.net",
    },
  });
  const body = JSON.parse(request.init.body);

  assert.equal(body.template_id, "template_autoreply");
  assert.equal(body.template_params.to_email, value.email);
  assert.equal(body.template_params.to_name, value.name);
  assert.equal(body.template_params.reply_to, "trade@grainmuse.net");
  assert.doesNotMatch(request.init.body, /turnstile/i);
});

test("reports successful EmailJS auto-reply delivery", async () => {
  const delivered = await sendContactConfirmation({
    value,
    config: {
      serviceId: "service_grainmuse",
      autoreplyTemplateId: "template_autoreply",
      publicKey: "public-key",
      toEmail: "trade@grainmuse.net",
    },
    fetchImpl: async () => new Response(null, { status: 200 }),
    signal: undefined,
  });

  assert.equal(delivered, true);
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

  assert.equal(delivered, false);
});

test("rejects an unsupported notification provider", () => {
  assert.throws(
    () => createNotificationRequest({ provider: "smtp", config: {}, value }),
    /Unsupported contact email provider/,
  );
});
