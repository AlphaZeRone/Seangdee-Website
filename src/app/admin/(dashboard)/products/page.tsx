import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBaht } from "@/lib/utils";
import { Badge, Button, Card } from "@/components/ui";
import type { Category, ProductWithCategory } from "@/lib/types";

export const metadata = { title: "สินค้า / สต๊อก — Seangdee Admin" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name_th");

  let query = supabase
    .from("products")
    .select(
      "*, category:categories(id,name_th,name_en,type), brand:brands(id,name), supplier:suppliers(id,name)"
    )
    .order("created_at", { ascending: false });

  if (status === "active" || status === "inactive") {
    query = query.eq("status", status);
  }
  if (category && UUID_RE.test(category)) {
    query = query.eq("category_id", category);
  }
  if (q) {
    // Strip characters that are meaningful in PostgREST's or() filter syntax
    // to avoid filter injection, then match as a case-insensitive substring.
    const safe = q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) {
      query = query.or(
        `name_th.ilike.%${safe}%,name_en.ilike.%${safe}%,sku.ilike.%${safe}%,barcode.ilike.%${safe}%`
      );
    }
  }

  const { data: products } = await query;
  const rows = (products as ProductWithCategory[]) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">สินค้า / สต๊อก</h1>
        <Link href="/admin/products/new">
          <Button>+ เพิ่มสินค้า</Button>
        </Link>
      </div>

      <Card className="mb-4">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div className="grow">
            <label className="mb-1 block text-xs text-slate-500">ค้นหา</label>
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="ชื่อสินค้า, SKU หรือบาร์โค้ด"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">หมวดหมู่</label>
            <select
              name="category"
              defaultValue={category ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">ทั้งหมด</option>
              {((categories as Category[]) ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_th}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">สถานะ</label>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ปิดการขาย</option>
            </select>
          </div>
          <Button type="submit" variant="secondary">
            กรอง
          </Button>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3 text-right">ราคาขาย</th>
              <th className="px-4 py-3 text-right">คงเหลือ</th>
              <th className="px-4 py-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  ยังไม่มีสินค้า — กด “เพิ่มสินค้า” เพื่อเริ่มต้น
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const low = p.quantity <= p.reorder_level;
              return (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center gap-3 font-medium text-slate-800"
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name_th}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                          —
                        </span>
                      )}
                      <span>{p.name_th}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.category?.name_th ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatBaht(p.sale_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={low ? "font-semibold text-amber-600" : ""}>
                      {p.quantity} {p.unit}
                    </span>
                    {low && (
                      <Badge tone="amber" className="ml-2">
                        สต๊อกต่ำ
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "active" ? (
                      <Badge tone="green">ใช้งาน</Badge>
                    ) : (
                      <Badge tone="gray">ปิดการขาย</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
