import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Data Access Layer — centralizes auth checks.
 * `cache` dedupes the work within a single render pass.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Require an authenticated staff/admin user. Redirects to the login page if the
 * visitor is not signed in or has no valid profile. Returns the user + profile.
 */
export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in at all → the admin login page.
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single<Profile>();

  // Signed in but NOT staff (e.g. a customer) → send home, NOT back to the admin
  // login page. Bouncing them to /admin/login would loop forever, because the
  // proxy redirects an authenticated user off the login page back into /admin.
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/");
  }

  return { user, profile };
});
