import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }).trim(),
  password: z.string().min(1, { error: "กรุณากรอกรหัสผ่าน" }),
});

/** Customer self-registration on the public site. */
export const customerSignupSchema = z.object({
  full_name: z.string().trim().min(1, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  email: z.email({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }).trim(),
  password: z
    .string()
    .min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }),
});

/** Customer login reuses the email+password shape. */
export const customerLoginSchema = loginSchema;

/** Admin changing another user's role on the staff-management page. */
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid({ error: "ผู้ใช้ไม่ถูกต้อง" }),
  role: z.enum(["admin", "staff", "customer"], { error: "บทบาทไม่ถูกต้อง" }),
});

export const productSchema = z.object({
  sku: z.string().min(1, { error: "กรุณากรอก SKU" }).trim(),
  name_th: z.string().min(1, { error: "กรุณากรอกชื่อสินค้า (ไทย)" }).trim(),
  name_en: z.string().min(1, { error: "Please enter product name (EN)" }).trim(),
  description_th: z.string().trim().optional().default(""),
  description_en: z.string().trim().optional().default(""),
  category_id: z.string().uuid({ error: "กรุณาเลือกหมวดหมู่" }).optional().or(z.literal("")),
  brand_id: z.string().uuid({ error: "กรุณาเลือกแบรนด์" }).optional().or(z.literal("")),
  supplier_id: z.string().uuid({ error: "กรุณาเลือกผู้จำหน่าย" }).optional().or(z.literal("")),
  barcode: z.string().trim().optional().default(""),
  serial_number: z.string().trim().optional().default(""),
  sale_price: z.coerce
    .number({ error: "ราคาขายต้องเป็นตัวเลข" })
    .min(0, { error: "ราคาขายต้องไม่ติดลบ" }),
  reorder_level: z.coerce
    .number({ error: "จุดสั่งซื้อต้องเป็นตัวเลข" })
    .int()
    .min(0)
    .default(0),
  unit: z.string().trim().min(1, { error: "กรุณากรอกหน่วยนับ" }).default("ชิ้น"),
  status: z.enum(["active", "inactive"]).default("active"),
  is_serialized: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean().default(false)
  ),
});

/** Create adds the initial (average) cost and starting quantity, which seed the
 *  product's first purchase stock movement. On update, cost is derived (not edited). */
export const productCreateSchema = productSchema.extend({
  cost_price: z.coerce
    .number({ error: "ราคาทุนต้องเป็นตัวเลข" })
    .min(0, { error: "ราคาทุนต้องไม่ติดลบ" }),
  initial_quantity: z.coerce.number().int().min(0).default(0),
});

export const stockMovementSchema = z
  .object({
    product_id: z.string().uuid({ error: "รหัสสินค้าไม่ถูกต้อง" }),
    change_qty: z.coerce
      .number({ error: "จำนวนต้องเป็นตัวเลข" })
      .int({ error: "จำนวนต้องเป็นจำนวนเต็ม" })
      .refine((n) => n !== 0, { error: "จำนวนต้องไม่เป็นศูนย์" }),
    reason: z.enum(["purchase", "sale", "adjustment", "return"]),
    // Unit cost of this batch — used to recompute weighted-average cost.
    // Empty string is treated as "not provided".
    unit_cost: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().min(0).optional()
    ),
    note: z.string().trim().optional().default(""),
  })
  .superRefine((val, ctx) => {
    if (val.reason === "purchase" && val.unit_cost === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["unit_cost"],
        message: "กรุณากรอกต้นทุนต่อหน่วยสำหรับการรับเข้า",
      });
    }
  });

export const categorySchema = z.object({
  slug: z
    .string()
    .min(1, { error: "กรุณากรอก slug" })
    .regex(/^[a-z0-9-]+$/, { error: "slug ใช้ได้เฉพาะ a-z, 0-9 และ -" })
    .trim(),
  name_th: z.string().min(1, { error: "กรุณากรอกชื่อหมวดหมู่ (ไทย)" }).trim(),
  name_en: z.string().min(1, { error: "Please enter category name (EN)" }).trim(),
  type: z.enum(["cctv", "internet", "accessory"]),
});

export const brandSchema = z.object({
  name: z.string().min(1, { error: "กรุณากรอกชื่อแบรนด์" }).trim(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, { error: "กรุณากรอกชื่อผู้จำหน่าย" }).trim(),
});

/** Header fields of a bill (customer info handled manually in the action). */
export const billHeaderSchema = z.object({
  customer_name: z.string().trim().optional().default(""),
  customer_phone: z.string().trim().optional().default(""),
  customer_address: z.string().trim().optional().default(""),
  customer_tax_id: z.string().trim().optional().default(""),
  note: z.string().trim().optional().default(""),
});

/** One requested line — the server looks up price/cost/stock itself, never trusting the client. */
export const billItemInputSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type BillItemInput = z.infer<typeof billItemInputSchema>;
