import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/site/product-card";
import { ProductFilters } from "@/components/site/product-filters";
import {
  CATEGORY_TABS,
  PAGE_SIZE,
  SORT_COLUMNS,
  UUID_RE,
  isCategoryType,
  isSortKey,
  type SortKey,
} from "@/lib/storefront";
import type { StorefrontProduct } from "@/lib/types";

export const metadata = {
  title: "สินค้า — Seangdee",
  description:
    "เลือกซื้อกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตหลากหลายรุ่นจากร้านแสงดี",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    brand?: string;
    sort?: string;
    stock?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;

  // Every incoming param is public and unauthenticated — validate before it
  // reaches a query.
  const q = sp.q ?? "";
  const cat = isCategoryType(sp.cat) ? sp.cat : "";
  const brand = UUID_RE.test(sp.brand ?? "") ? sp.brand! : "";
  const sort: SortKey = isSortKey(sp.sort) ? sp.sort : "newest";
  const inStock = sp.stock === "1";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();

  const order = SORT_COLUMNS[sort];
  let query = supabase
    .from("storefront_products")
    .select("*", { count: "exact" })
    .order(order.column, { ascending: order.ascending });

  if (cat) query = query.eq("category_type", cat);
  if (brand) query = query.eq("brand_id", brand);
  if (inStock) query = query.eq("in_stock", true);
  if (q.trim()) {
    // Strip characters that are meaningful in PostgREST's or() filter syntax to
    // avoid filter injection from this public, unauthenticated search input.
    const term = q.replace(/[%,()*\\]/g, " ").trim();
    if (term) {
      query = query.or(
        `name_th.ilike.%${term}%,name_en.ilike.%${term}%,sku.ilike.%${term}%,brand_name.ilike.%${term}%`
      );
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count }, { data: brandRows }] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    // Only brands that actually have a visible product, so the dropdown never
    // offers a filter that returns nothing.
    supabase
      .from("storefront_products")
      .select("brand_id, brand_name")
      .not("brand_id", "is", null),
  ]);

  const products = (data as StorefrontProduct[]) ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const brands = Array.from(
    new Map(
      (brandRows ?? [])
        .filter((b) => b.brand_id && b.brand_name)
        .map((b) => [b.brand_id as string, b.brand_name as string])
    ),
    ([id, name]) => ({ id, name })
  ).sort((a, b) => a.name.localeCompare(b.name, "th"));

  /** Rebuild the current URL with some params overridden. */
  const buildHref = (
    overrides: Partial<Record<"cat" | "q" | "brand" | "sort" | "stock" | "page", string>>
  ) => {
    const next = {
      cat,
      q,
      brand,
      sort: sort === "newest" ? "" : sort,
      stock: inStock ? "1" : "",
      page: page > 1 ? String(page) : "",
      ...overrides,
    };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const hasFilters = Boolean(q || cat || brand || inStock);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">สินค้าของเรา</h1>
        <p className="mt-1 text-sm text-slate-500">
          กล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตหลากหลายรุ่น พร้อมการรับประกันสินค้า
        </p>
      </header>

      <ProductFilters
        q={q}
        cat={cat}
        brand={brand}
        sort={sort}
        inStock={inStock}
        brands={brands}
      />

      {/* Category tabs — changing the type resets to page 1. */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((t) => {
          const active = cat === t.key;
          return (
            <Link
              key={t.key}
              href={buildHref({ cat: t.key, page: "" })}
              className={
                active
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Results */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-sm text-slate-500">
            {hasFilters ? "ไม่พบสินค้าที่ตรงกับการค้นหา" : "ยังไม่มีสินค้าในระบบ"}
          </p>
          {hasFilters && (
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              ล้างตัวกรองทั้งหมด
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
            <p>
              พบ {total} รายการ
              {totalPages > 1 && ` · หน้า ${page} จาก ${totalPages}`}
            </p>
            {hasFilters && (
              <Link href="/products" className="text-indigo-600 hover:underline">
                ล้างตัวกรอง
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  ← ก่อนหน้า
                </Link>
              )}
              <span className="px-3 text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  ถัดไป →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
