// Shared domain types for the Seangdee admin.

export type CategoryType = "cctv" | "internet" | "accessory";
export type ProductStatus = "active" | "inactive";
export type ProfileRole = "admin" | "staff" | "customer" | "pending";

/** Roles an admin may assign on the staff-management page. */
export const ASSIGNABLE_ROLES = ["admin", "staff", "customer"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
export type StockReason = "purchase" | "sale" | "adjustment" | "return";

export interface Category {
  id: string;
  slug: string;
  name_th: string;
  name_en: string;
  type: CategoryType;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name_th: string;
  name_en: string;
  description_th: string | null;
  description_en: string | null;
  category_id: string | null;
  brand_id: string | null;
  supplier_id: string | null;
  barcode: string | null;
  serial_number: string | null;
  is_serialized: boolean;
  cost_price: number;
  sale_price: number;
  quantity: number;
  reorder_level: number;
  unit: string;
  status: ProductStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  created_at: string;
}

export type UnitStatus = "in_stock" | "claimed" | "scrapped";

export interface ProductUnit {
  id: string;
  product_id: string;
  serial_number: string;
  supplier_id: string | null;
  unit_cost: number | null;
  status: UnitStatus;
  received_at: string;
  claimed_at: string | null;
  claim_note: string | null;
  note: string | null;
  created_at: string;
}

/** Unit joined with its product + supplier names (claims lookup). */
export interface ProductUnitWithRefs extends ProductUnit {
  product: Pick<Product, "id" | "name_th" | "sku" | "barcode"> | null;
  supplier: Pick<Supplier, "id" | "name"> | null;
}

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  in_stock: "อยู่ในระบบ",
  claimed: "เคลมแล้ว",
  scrapped: "ตัดจำหน่าย",
};

/** Product joined with its category, brand, and supplier (as returned by list queries). */
export interface ProductWithCategory extends Product {
  category: Pick<Category, "id" | "name_th" | "name_en" | "type"> | null;
  brand: Pick<Brand, "id" | "name"> | null;
  supplier: Pick<Supplier, "id" | "name"> | null;
}

export interface Bill {
  id: string;
  bill_no: string;
  is_tax_invoice: boolean;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_tax_id: string | null;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
}

export interface BillItem {
  id: string;
  bill_id: string;
  product_id: string | null;
  sku: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  unit_cost_at_sale: number;
  created_at: string;
}

/** Thailand VAT rate (percent). */
export const VAT_RATE = 7;

export interface StockMovement {
  id: string;
  product_id: string;
  change_qty: number;
  reason: StockReason;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

/** Customer-facing product, as returned by the `storefront_products` view.
 *  Deliberately omits cost_price, supplier, reorder level, and exact stock. */
export interface StorefrontProduct {
  id: string;
  sku: string;
  name_th: string;
  name_en: string;
  description_th: string | null;
  description_en: string | null;
  sale_price: number;
  unit: string;
  image_url: string | null;
  category_id: string | null;
  category_name_th: string | null;
  category_name_en: string | null;
  category_type: CategoryType | null;
  category_slug: string | null;
  brand_id: string | null;
  brand_name: string | null;
  in_stock: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: ProfileRole;
  created_at: string;
}

export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "ผู้ดูแล (admin)",
  staff: "พนักงาน (staff)",
  customer: "ลูกค้า (customer)",
  pending: "รออนุมัติ (pending)",
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  cctv: "กล้องวงจรปิด (CCTV)",
  internet: "อินเทอร์เน็ต (Internet)",
  accessory: "อุปกรณ์เสริม (Accessory)",
};

export const STOCK_REASON_LABELS: Record<StockReason, string> = {
  purchase: "รับเข้า (ซื้อ)",
  sale: "ขายออก",
  adjustment: "ปรับปรุงยอด",
  return: "รับคืน",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "ใช้งาน",
  inactive: "ปิดการขาย",
};
