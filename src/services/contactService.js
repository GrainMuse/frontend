import { publicEnv } from "../lib/env";
import { requireSupabase } from "../lib/supabase";
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";
import {
  getRemainingAttempts as getEmailRemainingAttempts,
  initEmailService,
  sendContactEmail,
  validateContactForm,
} from "./emailService";

export { validateContactForm };

export const usesSupabaseContact = publicEnv.contact.usesSupabase;
export const turnstileSiteKey = publicEnv.contact.turnstileSiteKey;

export function initContactService() {
  if (!usesSupabaseContact) initEmailService();
}

export function getRemainingAttempts() {
  return usesSupabaseContact ? null : getEmailRemainingAttempts();
}

async function functionErrorMessage(error) {
  if (error instanceof FunctionsHttpError) {
    const status = error.context?.status;
    try {
      const payload = await error.context.json();
      if (typeof payload?.error === "string") return payload.error;
    } catch {
      // The function returned a non-JSON error. Fall through to a safe message.
    }

    if (status === 429) {
      return "Too many requests. Please wait before trying again.";
    }
  }

  if (
    error instanceof FunctionsFetchError ||
    error instanceof FunctionsRelayError ||
    !navigator.onLine
  ) {
    return "We could not reach the contact service. Check your connection and try again.";
  }

  return "We could not process your message. Please try again later.";
}

async function sendWithSupabase(form, turnstileToken) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("submit-contact", {
    body: {
      name: form.name,
      email: form.email,
      phone: form.phone,
      type: form.type,
      message: form.message,
      turnstileToken,
    },
  });

  if (error) {
    return {
      ok: false,
      error: await functionErrorMessage(error),
    };
  }

  if (!data?.ok) {
    return {
      ok: false,
      error: "We could not process your message. Please try again later.",
    };
  }

  return {
    ok: true,
    notificationSent: data.notificationSent !== false,
    confirmationSent: false,
    requestId: data.requestId,
  };
}

export async function sendContactMessage(form, turnstileToken = "") {
  if (usesSupabaseContact) {
    return sendWithSupabase(form, turnstileToken);
  }

  const result = await sendContactEmail(form);
  return {
    ...result,
    notificationSent: result.ok,
    confirmationSent: result.ok,
  };
}
