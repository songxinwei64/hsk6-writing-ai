import { createClient } from "@supabase/supabase-js";

function requireEnvironmentVariable(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function createAdminClient() {
  return createClient(
    requireEnvironmentVariable(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnvironmentVariable(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
