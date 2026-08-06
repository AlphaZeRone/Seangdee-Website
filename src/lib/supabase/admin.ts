import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE ROLE key. It bypasses Row Level
 * Security, so it is ONLY ever created inside server-side code that has already
 * verified the caller is an admin (see `requireAdmin`). Never import this into a
 * Client Component or expose the key to the browser.
 *
 * Used for operations RLS intentionally forbids — e.g. changing a user's role
 * (there is no self-update policy on `profiles`) and listing auth users/emails.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
