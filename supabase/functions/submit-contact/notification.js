const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

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
          is_contact_enquiry: true,
          is_contact_confirmation: true,
          is_academy: false,
          subject: `New contact enquiry · ${value.type}`,
          preheader: `${value.name} submitted a ${value.type} enquiry.`,
          header_title: "New Contact Enquiry",
          header_subtitle: "Grain Muse Website",
          sender_name: "Grain Muse Website",
          from_name: value.name,
          email: value.email,
          reply_to: value.email,
          phone: value.phone ?? "Not provided",
          enquiry_type: value.type,
          message: value.message,
          submitted_at: new Date().toISOString(),
          site_url: "https://grainmuse.net",
          action_label: "Visit Grain Muse",
          action_url: "https://grainmuse.net",
          to_email: config.toEmail,
        },
      }),
    },
  };
}

export function createNotificationRequest({
  provider,
  config,
  value,
}) {
  if (provider === "emailjs") return emailJsRequest(config, value);
  throw new Error(`Unsupported contact email provider: ${provider}`);
}

async function sendRequest(request, fetchImpl, signal) {
  const response = await fetchImpl(request.url, {
    ...request.init,
    signal,
  });
  return { ok: response.ok, status: response.status };
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
