// Safe for frontend use: only the project URL and publishable/anon key belong here. Never put a service_role/secret key here.
export const SUPABASE_URL = "https://kvmyvudrsybmjdhqifxi.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_9rABKq29eAzYLI5eHs6oxw_VKKbQmOV";
export const isSupabaseConfigured =
  !SUPABASE_URL.includes("kvmyvudrsybmjdhqifxi") &&
  !SUPABASE_PUBLISHABLE_KEY.includes(
    "sb_publishable_9rABKq29eAzYLI5eHs6oxw_VKKbQmOV",
  );
