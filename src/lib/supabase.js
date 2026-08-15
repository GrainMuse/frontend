import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "./env";

const config = publicEnv.supabase;

export const supabase = config.enabled
  ? createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { "X-Client-Info": "grainmuse-web" },
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add the browser-safe values documented in .env.example.",
    );
  }

  return supabase;
}
