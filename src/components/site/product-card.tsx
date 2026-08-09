import Link from "next/link";
import { formatBaht } from "@/lib/utils";
import { TYPE_LABEL } from "@/lib/storefront";
import type { StorefrontProduct } from "@/lib/types";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name_th}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
            📦
          </div>
        )}
        {!product.in_stock && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
            สินค้าหมด
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category_type && (
          <span className="mb-1 text-xs font-medium text-indigo-600">
            {TYPE_LABEL[product.category_type] ?? product.category_name_th}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {product.name_th}
        </h3>
        {product.brand_name && (
          <p className="mt-0.5 text-xs text-slate-400">{product.brand_name}</p>
        )}
        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-slate-900">
            {formatBaht(product.sale_price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
