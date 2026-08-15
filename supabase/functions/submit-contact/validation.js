export const ENQUIRY_TYPES = new Set([
  "General Enquiry",
  "Wholesale / Trade",
  "Distribution Partnership",
  "Media & Press",
  "Product Feedback",
  "Other",
]);

const ALLOWED_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "type",
  "message",
  "turnstileToken",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[\d\s+()-]{7,20}$/;

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasInvalidCharacters(value) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 8 || code === 11 || code === 12 ||
      (code >= 14 && code <= 31) || code === 127;
  });
}

export function validateContactPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid request." };
  }

  if (Object.keys(payload).some((key) => !ALLOWED_FIELDS.has(key))) {
    return { ok: false, error: "Invalid request." };
  }

  const name = cleanString(payload.name);
  const email = cleanString(payload.email).toLowerCase();
  const phone = cleanString(payload.phone);
  const type = cleanString(payload.type) || "General Enquiry";
  const message = cleanString(payload.message);
  const turnstileToken = cleanString(payload.turnstileToken);

  if (name.length < 2 || name.length > 100 || hasInvalidCharacters(name)) {
    return { ok: false, error: "Please enter a valid name." };
  }

  if (
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    hasInvalidCharacters(email)
  ) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (phone && (!PHONE_PATTERN.test(phone) || hasInvalidCharacters(phone))) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  if (!ENQUIRY_TYPES.has(type)) {
    return { ok: false, error: "Please select a valid enquiry type." };
  }

  if (
    message.length < 10 ||
    message.length > 4000 ||
    hasInvalidCharacters(message)
  ) {
    return { ok: false, error: "Message must be between 10 and 4000 characters." };
  }

  if (!turnstileToken || turnstileToken.length > 2048) {
    return { ok: false, error: "Please complete the security check." };
  }

  return {
    ok: true,
    value: { name, email, phone: phone || null, type, message, turnstileToken },
  };
}
