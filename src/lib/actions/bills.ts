"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import { billHeaderSchema, billItemInputSchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

export async function createBill(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const header = billHeaderSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!header.success) {
    return { fieldErrors: toFieldErrors(header.error) };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "รายการสินค้าไม่ถูกต้อง" };
  }
  const items = z.array(billItemInputSchema).safeParse(rawItems);
  if (!items.success || items.data.length === 0) {
    return { error: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ" };
  }

  const isTaxInvoice =
    formData.get("is_tax_invoice") === "on" ||
    formData.get("is_tax_invoice") === "true";

  const supabase = await createClient();
  const { data: billId, error } = await supabase.rpc("create_bill", {
    p_items: items.data,
    p_is_tax_invoice: isTaxInvoice,
    p_customer_name: header.data.customer_name,
    p_customer_phone: header.data.customer_phone,
    p_customer_address: header.data.customer_address,
    p_customer_tax_id: header.data.customer_tax_id,
    p_note: header.data.note,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("insufficient stock"))
      return { error: "สต๊อกไม่พอสำหรับบางรายการ — กรุณาตรวจสอบจำนวนคงเหลือ" };
    if (msg.includes("not active"))
      return { error: "มีสินค้าที่ปิดการขายอยู่ในรายการ" };
    if (msg.includes("product not found"))
      return { error: "ไม่พบสินค้าบางรายการ" };
    return { error: `ออกบิลไม่สำเร็จ: ${msg}` };
  }

  revalidatePath("/admin/bills");
  revalidatePath("/admin/products");
  revalidatePath("/admin/summary");
  redirect(`/admin/bills/${billId as string}`);
}

/** Edit an existing (non-voided) bill: reverses the original sale and re-applies
 *  the new lines atomically (see update_bill RPC). */
export async function updateBill(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const billId = String(formData.get("bill_id") ?? "");
  if (!billId) return { error: "ไม่พบรหัสบิล" };

  const header = billHeaderSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!header.success) {
    return { fieldErrors: toFieldErrors(header.error) };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "รายการสินค้าไม่ถูกต้อง" };
  }
  const items = z.array(billItemInputSchema).safeParse(rawItems);
  if (!items.success || items.data.length === 0) {
    return { error: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ" };
  }

  const isTaxInvoice =
    formData.get("is_tax_invoice") === "on" ||
    formData.get("is_tax_invoice") === "true";

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_bill", {
    p_bill_id: billId,
    p_items: items.data,
    p_is_tax_invoice: isTaxInvoice,
    p_customer_name: header.data.customer_name,
    p_customer_phone: header.data.customer_phone,
    p_customer_address: header.data.customer_address,
    p_customer_tax_id: header.data.customer_tax_id,
    p_note: header.data.note,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("insufficient stock"))
      return { error: "สต๊อกไม่พอสำหรับบางรายการ — กรุณาตรวจสอบจำนวนคงเหลือ" };
    if (msg.includes("not active"))
      return { error: "มีสินค้าที่ปิดการขายอยู่ในรายการ" };
    if (msg.includes("product not found"))
      return { error: "ไม่พบสินค้าบางรายการ" };
    if (msg.includes("voided bill"))
      return { error: "บิลนี้ถูกยกเลิกแล้ว แก้ไขไม่ได้" };
    return { error: `แก้ไขบิลไม่สำเร็จ: ${msg}` };
  }

  revalidatePath("/admin/bills");
  revalidatePath(`/admin/bills/${billId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/summary");
  redirect(`/admin/bills/${billId}`);
}

/** Void (cancel) a bill: returns its sold stock and marks it ยกเลิก. Called
 *  directly from a client component, not via a form. */
export async function voidBill(
  billId: string,
  reason: string
): Promise<{ error?: string }> {
  await requireStaff();

  const supabase = await createClient();
  const { error } = await supabase.rpc("void_bill", {
    p_bill_id: billId,
    p_reason: reason,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("already voided"))
      return { error: "บิลนี้ถูกยกเลิกไปแล้ว" };
    if (msg.includes("bill not found")) return { error: "ไม่พบบิล" };
    if (msg.includes("not authorized")) return { error: "ไม่มีสิทธิ์ยกเลิกบิล" };
    return { error: `ยกเลิกบิลไม่สำเร็จ: ${msg}` };
  }

  revalidatePath("/admin/bills");
  revalidatePath(`/admin/bills/${billId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/summary");
  return {};
}
