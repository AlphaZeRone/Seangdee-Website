import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBaht } from "@/lib/utils";
import { SHOP } from "@/lib/shop";
import type { StorefrontProduct } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  cctv: "กล้องวงจรปิด",
  internet: "อินเทอร์เน็ต",
  accessory: "อุปกรณ์เสริม",
};

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

  const telHref = `tel:${SHOP.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/products" className="hover:text-slate-900">
          สินค้า
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{product.name_th}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <div className="aspect-square w-full">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name_th}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl text-slate-300">
                📦
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

          <div className="mt-4 flex items-center gap-3">
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

          {(product.brand_name || product.sku) && (
            <dl className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
              {product.brand_name && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">ยี่ห้อ</dt>
                  <dd className="font-medium text-slate-800">{product.brand_name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">รหัสสินค้า</dt>
                <dd className="font-medium text-slate-800">{product.sku}</dd>
              </div>
            </dl>
          )}

          {/* CTA — no online checkout yet; customers order by phone. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={telHref}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              📞 โทรสั่งซื้อ / สอบถาม {SHOP.phone}
            </a>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ดูสินค้าอื่น
            </Link>
          </div>

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
    </div>
  );
}
