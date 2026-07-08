"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import {
  productCreateSchema,
  productSchema,
  stockMovementSchema,
} from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

async function uploadImage(
  supabase: SupabaseClient,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data
    .publicUrl;
}

export async function createProduct(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const parsed = productCreateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const supabase = await createClient();

  let imageUrl: string | null = null;
  try {
    imageUrl = await uploadImage(supabase, formData.get("image") as File | null);
  } catch {
    return { error: "อัปโหลดรูปภาพไม่สำเร็จ" };
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      sku: d.sku,
      name_th: d.name_th,
      name_en: d.name_en,
      description_th: d.description_th || null,
      description_en: d.description_en || null,
      category_id: d.category_id || null,
      brand_id: d.brand_id || null,
      supplier_id: d.supplier_id || null,
      barcode: d.barcode || null,
      serial_number: d.is_serialized ? null : d.serial_number || null,
      is_serialized: d.is_serialized,
      cost_price: d.cost_price,
      sale_price: d.sale_price,
      reorder_level: d.reorder_level,
      unit: d.unit,
      status: d.status,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error || !product) {
    if (error?.code === "23505") return { error: "SKU นี้มีอยู่แล้วในระบบ" };
    return { error: `บันทึกไม่สำเร็จ: ${error?.message ?? "unknown"}` };
  }

  // Serialized products receive their units (with serials) via the stock page,
  // so skip the plain initial-quantity movement for them.
  if (!d.is_serialized && d.initial_quantity > 0) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("stock_movements").insert({
      product_id: product.id,
      change_qty: d.initial_quantity,
      reason: "purchase",
      unit_cost: d.cost_price,
      note: "สต๊อกเริ่มต้น",
      created_by: user?.id ?? null,
    });
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ไม่พบรหัสสินค้า" };

  const parsed = productSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const supabase = await createClient();

  let imageUrl: string | undefined;
  try {
    const uploaded = await uploadImage(
      supabase,
      formData.get("image") as File | null
    );
    if (uploaded) imageUrl = uploaded;
  } catch {
    return { error: "อัปโหลดรูปภาพไม่สำเร็จ" };
  }

  const { error } = await supabase
    .from("products")
    .update({
      sku: d.sku,
      name_th: d.name_th,
      name_en: d.name_en,
      description_th: d.description_th || null,
      description_en: d.description_en || null,
      category_id: d.category_id || null,
      brand_id: d.brand_id || null,
      supplier_id: d.supplier_id || null,
      barcode: d.barcode || null,
      serial_number: d.is_serialized ? null : d.serial_number || null,
      is_serialized: d.is_serialized,
      sale_price: d.sale_price,
      reorder_level: d.reorder_level,
      unit: d.unit,
      status: d.status,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "SKU นี้มีอยู่แล้วในระบบ" };
    return { error: `บันทึกไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}`);
}

/** Soft delete — mark inactive rather than removing history. */
export async function setProductStatus(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "inactive");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ status: status === "active" ? "active" : "inactive" })
    .eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

/** Hard delete a product. Its stock movements cascade away; past bill_items keep
 *  their snapshot (product_id set null) so historical bills/summaries survive. */
export async function deleteProduct(
  id: string
): Promise<{ error?: string }> {
  await requireStaff();
  if (!id) return { error: "ไม่พบรหัสสินค้า" };

  const supabase = await createClient();

  const { data: prod } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: `ลบสินค้าไม่สำเร็จ: ${error.message}` };
  }

  // Best-effort: remove the product image from storage (ignore failures).
  if (prod?.image_url) {
    const marker = "/product-images/";
    const idx = prod.image_url.indexOf(marker);
    if (idx !== -1) {
      await supabase.storage
        .from("product-images")
        .remove([prod.image_url.slice(idx + marker.length)]);
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function addStockMovement(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireStaff();

  const parsed = stockMovementSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("stock_movements").insert({
    product_id: d.product_id,
    change_qty: d.change_qty,
    reason: d.reason,
    unit_cost: d.unit_cost ?? null,
    note: d.note || null,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: `บันทึกการเคลื่อนไหวสต๊อกไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${d.product_id}`);
  return { success: "บันทึกการเคลื่อนไหวสต๊อกเรียบร้อย" };
}

/** Delete a stock movement and reconcile the product's quantity + average cost.
 *  Billing-owned movements (sales, void-returns) are rejected by the RPC. */
export async function deleteStockMovement(
  movementId: string,
  productId: string
): Promise<{ error?: string }> {
  await requireStaff();

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_stock_movement", {
    p_movement_id: movementId,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("billing movement"))
      return { error: "รายการนี้มาจากบิล — ให้ยกเลิกบิลแทน" };
    if (msg.includes("movement not found")) return { error: "ไม่พบรายการ" };
    if (msg.includes("not authorized")) return { error: "ไม่มีสิทธิ์ลบรายการ" };
    return { error: `ลบรายการไม่สำเร็จ: ${msg}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return {};
}
