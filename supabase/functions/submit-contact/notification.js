const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

function emailJsRequest(config, value) {
  return {
    url: EMAILJS_ENDPOINT,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        ...(config.privateKey ? { accessToken: config.privateKey } : {}),
        template_params: {
          from_name: value.name,
          reply_to: value.email,
          phone: value.phone ?? "Not provided",
          enquiry_type: value.type,
          message: value.message,
          submitted_at: new Date().toISOString(),
          to_email: config.toEmail,
        },
      }),
    },
  };
}

function emailJsConfirmationRequest(config, value) {
  return {
    url: EMAILJS_ENDPOINT,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.autoreplyTemplateId,
        user_id: config.publicKey,
        ...(config.privateKey ? { accessToken: config.privateKey } : {}),
        template_params: {
          from_name: value.name,
          to_name: value.name,
          to_email: value.email,
          reply_to: config.toEmail,
          phone: value.phone ?? "Not provided",
          enquiry_type: value.type,
          message: value.message,
          submitted_at: new Date().toISOString(),
        },
      }),
    },
  };
}

function resendRequest(config, submissionId, value) {
  return {
    url: RESEND_ENDPOINT,
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact-${submissionId}-notification`,
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [config.toEmail],
        reply_to: value.email,
        subject: `New Grain Muse enquiry: ${value.type}`,
        text: [
          `Name: ${value.name}`,
          `Email: ${value.email}`,
          `Phone: ${value.phone ?? "Not provided"}`,
          `Type: ${value.type}`,
          "",
          value.message,
        ].join("\n"),
      }),
    },
  };
}

export function createNotificationRequest({
  provider,
  config,
  submissionId,
  value,
}) {
  if (provider === "emailjs") return emailJsRequest(config, value);
  if (provider === "resend") {
    return resendRequest(config, submissionId, value);
  }
  throw new Error(`Unsupported contact email provider: ${provider}`);
}

export function createConfirmationRequest({ config, value }) {
  return emailJsConfirmationRequest(config, value);
}

async function sendRequest(request, fetchImpl, signal) {
  const response = await fetchImpl(request.url, {
    ...request.init,
    signal,
  });
  return response.ok;
}

export async function sendContactNotification({
  provider,
  config,
  submissionId,
  value,
  fetchImpl = fetch,
  signal = AbortSignal.timeout(8_000),
}) {
  const request = createNotificationRequest({
    provider,
    config,
    submissionId,
    value,
  });
  return sendRequest(request, fetchImpl, signal);
}

export async function sendContactConfirmation({
  config,
  value,
  fetchImpl = fetch,
  signal = AbortSignal.timeout(8_000),
}) {
  const request = createConfirmationRequest({ config, value });
  return sendRequest(request, fetchImpl, signal);
}
