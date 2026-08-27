import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBaht } from "@/lib/utils";
import { SHOP, TEL_HREF } from "@/lib/shop";
import { ProductCard } from "@/components/site/product-card";
import { TYPE_LABEL } from "@/lib/storefront";
import type { StorefrontProduct } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("storefront_products")
    .select("name_th, description_th")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { title: "ไม่พบสินค้า — Seangdee" };
  return {
    title: `${data.name_th} — Seangdee`,
    description: data.description_th ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("storefront_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const product = data as StorefrontProduct;

  // More from the same category, so a dead end becomes another way to browse.
  const { data: relatedRows } = product.category_id
    ? await supabase
        .from("storefront_products")
        .select("*")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .order("created_at", { ascending: false })
        .limit(4)
    : { data: null };
  const related = (relatedRows as StorefrontProduct[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/products" className="hover:text-slate-900">
          สินค้า
        </Link>
        <span>/</span>
        {product.category_type && (
          <>
            <Link
              href={`/products?cat=${product.category_type}`}
              className="hover:text-slate-900"
            >
              {TYPE_LABEL[product.category_type] ?? product.category_name_th}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-700">{product.name_th}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:sticky md:top-24 md:self-start">
          <div className="aspect-square w-full">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name_th}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
                <span className="text-6xl">📦</span>
                <span className="text-xs">ยังไม่มีรูปสินค้า</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category_type && (
            <span className="text-sm font-medium text-indigo-600">
              {TYPE_LABEL[product.category_type] ?? product.category_name_th}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            {product.name_th}
          </h1>
          {product.name_en && (
            <p className="mt-1 text-sm text-slate-400">{product.name_en}</p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-slate-900">
              {formatBaht(product.sale_price)}
            </p>
            <span className="text-sm text-slate-400">/ {product.unit}</span>
          </div>

          <div className="mt-3">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                ● มีสินค้าพร้อมจำหน่าย
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-600">
                ● สินค้าหมดชั่วคราว
              </span>
            )}
          </div>

          <dl className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
            {product.brand_name && (
              <div className="flex justify-between">
                <dt className="text-slate-500">ยี่ห้อ</dt>
                <dd className="font-medium text-slate-800">
                  <Link
                    href={`/products?brand=${product.brand_id}`}
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {product.brand_name}
                  </Link>
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">รหัสสินค้า</dt>
              <dd className="font-medium text-slate-800">{product.sku}</dd>
            </div>
            {product.category_name_th && (
              <div className="flex justify-between">
                <dt className="text-slate-500">หมวดหมู่</dt>
                <dd className="font-medium text-slate-800">
                  {product.category_name_th}
                </dd>
              </div>
            )}
          </dl>

          {/* CTA — no online checkout yet; customers order by phone or LINE. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={TEL_HREF}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              📞 โทรสั่งซื้อ {SHOP.phone}
            </a>
            <div className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700">
              💬 LINE {SHOP.line_id}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            ยังไม่รองรับการสั่งซื้อออนไลน์ — สอบถามและสั่งซื้อผ่านโทรศัพท์หรือไลน์
          </p>

          {/* Trust strip */}
          <ul className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <span>🛡️</span> รับประกันตามซีเรียล
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> สินค้าของแท้
            </li>
            <li className="flex items-center gap-2">
              <span>🏬</span> รับที่ร้านได้
            </li>
          </ul>

          {product.description_th && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                รายละเอียดสินค้า
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {product.description_th}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-100 pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">สินค้าที่ใกล้เคียงกัน</h2>
            <Link
              href={`/products?cat=${product.category_type ?? ""}`}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
