"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import type { FormState } from "@/lib/form";

/** Receive serialized stock: one purchase movement + one unit row per serial,
 *  written atomically by the receive_units RPC. */
export async function receiveUnits(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const productId = String(formData.get("product_id") ?? "");
  if (!productId) return { error: "ไม่พบรหัสสินค้า" };

  const serials = String(formData.get("serials") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (serials.length === 0) {
    return { error: "กรุณากรอก Serial Number อย่างน้อย 1 รายการ" };
  }
  // Guard against duplicates within the same paste.
  const dupes = serials.filter((s, i) => serials.indexOf(s) !== i);
  if (dupes.length > 0) {
    return { error: `มี Serial ซ้ำในรายการ: ${[...new Set(dupes)].join(", ")}` };
  }

  const supplierId = String(formData.get("supplier_id") ?? "");
  const rawCost = String(formData.get("unit_cost") ?? "").trim();
  const unitCost = rawCost === "" ? null : Number(rawCost);
  if (unitCost !== null && (Number.isNaN(unitCost) || unitCost < 0)) {
    return { error: "ต้นทุนต่อหน่วยไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data: count, error } = await supabase.rpc("receive_units", {
    p_product_id: productId,
    p_serials: serials,
    p_supplier_id: supplierId || null,
    p_unit_cost: unitCost,
    p_note: String(formData.get("note") ?? ""),
  });

  if (error) {
    if (error.code === "23505")
      return { error: "มี Serial Number ซ้ำกับที่มีอยู่แล้วในระบบ" };
    return { error: `รับเข้าไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { success: `รับเข้า ${count as number} หน่วยเรียบร้อย` };
}

/** Mark a unit as claimed (warranty) or scrapped. Record-keeping only — does
 *  not change stock quantity (see Plan A notes). */
export async function setUnitStatus(
  unitId: string,
  status: "claimed" | "scrapped" | "in_stock",
  note: string
): Promise<{ error?: string }> {
  await requireStaff();
  if (!unitId) return { error: "ไม่พบหน่วยสินค้า" };

  const supabase = await createClient();
  const { data: unit } = await supabase
    .from("product_units")
    .select("product_id")
    .eq("id", unitId)
    .single();

  const { error } = await supabase
    .from("product_units")
    .update({
      status,
      claimed_at: status === "in_stock" ? null : new Date().toISOString(),
      claim_note: note.trim() || null,
    })
    .eq("id", unitId);

  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath("/admin/claims");
  if (unit?.product_id) revalidatePath(`/admin/products/${unit.product_id}`);
  return {};
}
