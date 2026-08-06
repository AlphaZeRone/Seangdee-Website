"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserRoleSchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

/**
 * Change a user's role. Admin-only (enforced by `requireAdmin`). Uses the
 * service-role client because `profiles` has no self-/staff-update RLS policy —
 * roles are deliberately mutable only through trusted server code.
 */
export async function updateUserRole(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await requireAdmin();

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  // Guard: an admin cannot change their OWN role — prevents self-lockout
  // (e.g. demoting yourself and leaving no admin, or losing admin access).
  if (parsed.data.userId === user.id) {
    return { error: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: `อัปเดตบทบาทไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/staff");
  return { success: "อัปเดตบทบาทเรียบร้อย" };
}
