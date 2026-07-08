"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import { categorySchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

export async function createCategory(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const parsed = categorySchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { error: "slug นี้มีอยู่แล้ว" };
    return { error: `บันทึกไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  return { success: "เพิ่มหมวดหมู่เรียบร้อย" };
}

export async function deleteCategory(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
