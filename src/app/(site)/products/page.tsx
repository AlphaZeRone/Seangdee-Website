import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/site/product-card";
import type { StorefrontProduct } from "@/lib/types";

export const metadata = {
  title: "สินค้า — Seangdee",
  description:
    "เลือกซื้อกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตหลากหลายรุ่นจากร้านแสงดี",
};

const TABS = [
  { key: "", label: "ทั้งหมด" },
  { key: "cctv", label: "กล้องวงจรปิด" },
  { key: "internet", label: "อินเทอร์เน็ต" },
  { key: "accessory", label: "อุปกรณ์เสริม" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("storefront_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (cat) query = query.eq("category_type", cat);
  if (q.trim()) {
    const term = q.trim();
    query = query.or(
      `name_th.ilike.%${term}%,name_en.ilike.%${term}%,sku.ilike.%${term}%,brand_name.ilike.%${term}%`
    );
  }

  const { data } = await query;
  const products = (data as StorefrontProduct[]) ?? [];

  const buildHref = (nextCat: string) => {
    const params = new URLSearchParams();
    if (nextCat) params.set("cat", nextCat);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">สินค้าของเรา</h1>
        <p className="mt-1 text-sm text-slate-500">
          กล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตหลากหลายรุ่น พร้อมการรับประกันสินค้า
        </p>
      </header>

      {/* Search */}
      <form action="/products" className="mb-6">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาสินค้า เช่น กล้อง, เราเตอร์, ยี่ห้อ…"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = cat === t.key;
          return (
            <Link
              key={t.key}
              href={buildHref(t.key)}
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
            {q || cat
              ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
              : "ยังไม่มีสินค้าในระบบ"}
          </p>
          {(q || cat) && (
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              ดูสินค้าทั้งหมด
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">พบ {products.length} รายการ</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
