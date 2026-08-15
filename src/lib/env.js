const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const contactBackend =
  import.meta.env.VITE_CONTACT_BACKEND?.trim().toLowerCase() || "emailjs";
const turnstileSiteKey =
  import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function validateSupabaseConfig() {
  if (!supabaseUrl && !supabasePublishableKey) {
    return { enabled: false, url: "", publishableKey: "" };
  }

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid URL.");
  }

  if (parsedUrl.protocol !== "https:" && !isLocalHostname(parsedUrl.hostname)) {
    throw new Error("VITE_SUPABASE_URL must use HTTPS outside local development.");
  }

  if (
    supabasePublishableKey.startsWith("sb_secret_") ||
    supabasePublishableKey.toLowerCase().includes("service_role")
  ) {
    throw new Error(
      "A privileged Supabase key was supplied to the browser. Use a publishable key and rotate the exposed key.",
    );
  }

  const isCurrentPublishableKey =
    supabasePublishableKey.startsWith("sb_publishable_");
  const isLegacyAnonKey = supabasePublishableKey.startsWith("eyJ");

  if (!isCurrentPublishableKey && !isLegacyAnonKey) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY is not a recognized publishable or legacy anon key.",
    );
  }

  return {
    enabled: true,
    url: parsedUrl.origin,
    publishableKey: supabasePublishableKey,
  };
}

function validateContactConfig(supabaseConfig) {
  if (!new Set(["emailjs", "supabase"]).has(contactBackend)) {
    throw new Error(
      'VITE_CONTACT_BACKEND must be either "emailjs" or "supabase".',
    );
  }

  if (contactBackend === "supabase" && !supabaseConfig.enabled) {
    throw new Error(
      "The Supabase contact backend requires a valid Supabase URL and publishable key.",
    );
  }

  if (contactBackend === "supabase" && !turnstileSiteKey) {
    throw new Error(
      "The Supabase contact backend requires VITE_TURNSTILE_SITE_KEY.",
    );
  }

  return {
    backend: contactBackend,
    usesSupabase: contactBackend === "supabase",
    turnstileSiteKey,
  };
}

const supabase = Object.freeze(validateSupabaseConfig());

export const publicEnv = Object.freeze({
  supabase,
  contact: Object.freeze(validateContactConfig(supabase)),
});
