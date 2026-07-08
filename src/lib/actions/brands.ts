"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import { brandSchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

export async function createBrand(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const parsed = brandSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { error: "แบรนด์นี้มีอยู่แล้ว" };
    return { error: `บันทึกไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/brands");
  return { success: "เพิ่มแบรนด์เรียบร้อย" };
}

export async function deleteBrand(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/brands");
}
