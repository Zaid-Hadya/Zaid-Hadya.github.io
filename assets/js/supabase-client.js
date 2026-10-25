import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from "./supabase-config.js";
let clientPromise;
export async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  if (!clientPromise) clientPromise = import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }));
  return clientPromise;
}
