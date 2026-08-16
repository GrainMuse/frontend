const STATUS_LABELS = Object.freeze({
  shortlisted: "shortlisted",
  accepted: "accepted",
  rejected: "not selected",
});

const SITE_URL = "https://grainmuse.net";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function renderAcademyEmail(notification, adminEmail) {
  const payload = notification.payload ?? {};
  const applicantName = clean(payload.applicantName) || "Applicant";
  const programTitle = clean(payload.programTitle) || "PATHFINDER Academy program";

  switch (notification.event_type) {
    case "application_submitted":
      return {
        to: notification.recipient_email,
        subject: `Application received · ${programTitle}`,
        preheader: `We received your application for ${programTitle}.`,
        eyebrow: "APPLICATION RECEIVED",
        headline: "Your PATHFINDER journey starts here",
        actionLabel: "View application",
        actionUrl: `${SITE_URL}/pathfinder-academy/account`,
        text: [
          `Hello ${applicantName},`,
          "",
          `We have received your application for ${programTitle}.`,
          "You can review its current status from your PATHFINDER Academy applicant account.",
          "",
          "Thank you,",
          "PATHFINDER Academy",
        ].join("\n"),
      };
    case "admin_new_application":
      return {
        to: adminEmail,
        replyTo: clean(payload.applicantEmail) || undefined,
        subject: `New PATHFINDER application · ${programTitle}`,
        preheader: `${applicantName} submitted an application for ${programTitle}.`,
        eyebrow: "NEW APPLICATION",
        headline: "A candidate is ready for review",
        actionLabel: "Review application",
        actionUrl: `${SITE_URL}/admin`,
        text: [
          `A new application was submitted for ${programTitle}.`,
          "",
          `Applicant: ${applicantName}`,
          `Email: ${clean(payload.applicantEmail) || "Not provided"}`,
          "",
          "Open the Grain Muse admin portal to review it.",
        ].join("\n"),
      };
    case "application_withdrawn":
      return {
        to: notification.recipient_email,
        subject: `Application withdrawn · ${programTitle}`,
        preheader: `Your application for ${programTitle} was withdrawn.`,
        eyebrow: "APPLICATION UPDATE",
        headline: "Your withdrawal is confirmed",
        actionLabel: "Explore PATHFINDER",
        actionUrl: `${SITE_URL}/pathfinder-academy`,
        text: [
          `Hello ${applicantName},`,
          "",
          `Your application for ${programTitle} has been withdrawn.`,
          "If this was unexpected, please contact PATHFINDER Academy.",
          "",
          "PATHFINDER Academy",
        ].join("\n"),
      };
    case "application_status_changed": {
      const status = clean(payload.status);
      const label = STATUS_LABELS[status] || status || "updated";
      return {
        to: notification.recipient_email,
        subject: `Application update · ${programTitle}`,
        preheader: `Your ${programTitle} application status has been updated.`,
        eyebrow: "APPLICATION STATUS",
        headline: status === "accepted"
          ? "Welcome to PATHFINDER Academy"
          : "Your application has been updated",
        actionLabel: "View application",
        actionUrl: `${SITE_URL}/pathfinder-academy/account`,
        text: [
          `Hello ${applicantName},`,
          "",
          `Your application for ${programTitle} has been ${label}.`,
          "Sign in to your PATHFINDER Academy applicant account to review the current status.",
          "",
          "PATHFINDER Academy",
        ].join("\n"),
      };
    }
    default:
      throw new Error("unsupported_notification_event");
  }
}

export function createEmailJsRequest(notification, email, config) {
  if (!email.to) throw new Error("recipient_missing");
  return {
    url: "https://api.emailjs.com/api/v1.0/email/send",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        ...(config.privateKey ? { accessToken: config.privateKey } : {}),
        template_params: {
          is_contact_enquiry: false,
          is_contact_confirmation: false,
          is_academy: true,
          sender_name: "PATHFINDER Academy",
          to_email: email.to,
          reply_to: email.replyTo || config.replyToEmail,
          subject: email.subject,
          message: email.text,
          preheader: email.preheader,
          eyebrow: email.eyebrow,
          headline: email.headline,
          action_label: email.actionLabel,
          action_url: email.actionUrl,
          event_type: notification.event_type,
          notification_id: notification.id,
          idempotency_key: notification.idempotency_key,
        },
      }),
    },
  };
}
