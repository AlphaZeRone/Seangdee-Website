"use client";

import { useRef } from "react";
import { SORT_OPTIONS, type SortKey } from "@/lib/storefront";

/**
 * Filter bar for the storefront. Plain GET form so the page stays a server
 * component and every filter combination is a shareable URL; the selects just
 * auto-submit on change so it feels instant without extra clicks.
 */
export function ProductFilters({
  q,
  cat,
  brand,
  sort,
  inStock,
  brands,
}: {
  q: string;
  cat: string;
  brand: string;
  sort: SortKey;
  inStock: boolean;
  brands: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} action="/products" className="mb-6 space-y-3">
      {/* Category lives in the tab row below, but must survive a re-submit. */}
      <input type="hidden" name="cat" value={cat} />

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

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="hidden sm:inline">ยี่ห้อ</span>
          <select
            name="brand"
            defaultValue={brand}
            onChange={submit}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">ทุกยี่ห้อ</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="hidden sm:inline">เรียงตาม</span>
          <select
            name="sort"
            defaultValue={sort}
            onChange={submit}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="stock"
            value="1"
            defaultChecked={inStock}
            onChange={submit}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          เฉพาะสินค้าที่มีของ
        </label>
      </div>
    </form>
  );
}
