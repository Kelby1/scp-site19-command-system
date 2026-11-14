import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    !rawUrl.includes("placeholder") &&
    rawUrl.startsWith("http")
);

const supabaseUrl = isSupabaseConfigured
  ? rawUrl
  : "https://placeholder.supabase.co";
const supabaseAnonKey = isSupabaseConfigured
  ? rawKey
  : "placeholder-anon-key";

if (!isSupabaseConfigured) {
  console.warn(
    "[SUPABASE] Missing or incomplete VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment. " +
      "Application is running in unconfigured mode. Set your keys in .env and restart Vite to enable live authentication."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);