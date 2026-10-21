import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local file."
  );
}

/**
 * Zuriq Fashion — Supabase Browser Client
 *
 * Singleton client for use on the client-side (browser).
 * Import this wherever you need to query Supabase from React components.
 *
 * @example
 * import { supabase } from "@/lib/supabase";
 * const { data, error } = await supabase.from("products").select("*");
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { SupabaseClient } from "@supabase/supabase-js";
