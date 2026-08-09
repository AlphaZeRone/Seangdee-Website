// Shared storefront constants.
//
// These live outside the filter component on purpose: that component is
// "use client", and a plain value imported from a client module into a server
// component arrives as a client-reference proxy rather than the real value.
// Keeping them here lets both sides import the same actual data.

import type { CategoryType } from "@/lib/types";

export const SORT_OPTIONS = [
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "price_asc", label: "ราคา: ต่ำ → สูง" },
  { value: "price_desc", label: "ราคา: สูง → ต่ำ" },
  { value: "name", label: "ชื่อสินค้า (ก-ฮ)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** Whitelisted sort keys → the column/direction actually passed to PostgREST.
 *  Never interpolate the raw `sort` param into .order(). */
export const SORT_COLUMNS: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  price_asc: { column: "sale_price", ascending: true },
  price_desc: { column: "sale_price", ascending: false },
  name: { column: "name_th", ascending: true },
};

export function isSortKey(value: string | undefined): value is SortKey {
  return SORT_OPTIONS.some((o) => o.value === value);
}

/** Top-level category tabs on /products. */
export const CATEGORY_TABS = [
  { key: "", label: "ทั้งหมด" },
  { key: "cctv", label: "กล้องวงจรปิด" },
  { key: "internet", label: "อินเทอร์เน็ต" },
  { key: "accessory", label: "อุปกรณ์เสริม" },
] as const;

/** Short customer-facing label for a category type. */
export const TYPE_LABEL: Record<CategoryType, string> = {
  cctv: "กล้องวงจรปิด",
  internet: "อินเทอร์เน็ต",
  accessory: "อุปกรณ์เสริม",
};

export function isCategoryType(value: string | undefined): value is CategoryType {
  return value === "cctv" || value === "internet" || value === "accessory";
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PAGE_SIZE = 24;
