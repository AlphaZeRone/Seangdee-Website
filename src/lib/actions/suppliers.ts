"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import { supplierSchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

export async function createSupplier(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const parsed = supplierSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { error: "ผู้จำหน่ายนี้มีอยู่แล้ว" };
    return { error: `บันทึกไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/suppliers");
  return { success: "เพิ่มผู้จำหน่ายเรียบร้อย" };
}

export async function deleteSupplier(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("suppliers").delete().eq("id", id);
  revalidatePath("/admin/suppliers");
}
