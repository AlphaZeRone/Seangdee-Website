import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBaht, formatDateTime } from "@/lib/utils";
import { Badge, Button, Card, Input } from "@/components/ui";
import { ClaimUnitButton } from "@/components/admin/claim-unit-button";
import { UNIT_STATUS_LABELS, type ProductUnitWithRefs } from "@/lib/types";

export const metadata = { title: "เคลมสินค้า — Seangdee Admin" };

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("product_units")
    .select(
      "*, product:products(id,name_th,sku,barcode), supplier:suppliers(id,name)"
    )
    .order("received_at", { ascending: false })
    .limit(100);

  if (q) {
    const term = q.replace(/[,()%]/g, " ").trim();
    if (term) query = query.ilike("serial_number", `%${term}%`);
  }

  const { data } = await query;
  const units = (data as ProductUnitWithRefs[]) ?? [];

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">เคลมสินค้า / Warranty</h1>
        <p className="text-sm text-slate-500">
          ค้นหาด้วย Serial Number เพื่อดูว่าต้องเคลมกับผู้จำหน่ายรายใด
        </p>
      </div>

      <form method="get" className="my-4 flex flex-wrap items-center gap-2">
        <div className="min-w-[240px] grow sm:grow-0 sm:basis-96">
          <Input
            name="q"
            defaultValue={q}
            placeholder="สแกนหรือพิมพ์ Serial Number…"
            autoFocus
          />
        </div>
        <Button type="submit" variant="secondary">
          ค้นหา
        </Button>
        {q && (
          <Link href="/admin/claims" className="text-sm text-indigo-600">
            ล้าง
          </Link>
        )}
      </form>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">Serial</th>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">ผู้จำหน่าย (เคลมที่นี่)</th>
              <th className="px-4 py-3">รับเข้า</th>
              <th className="px-4 py-3 text-right">ต้นทุน</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  {q ? "ไม่พบ Serial ที่ตรงกับคำค้นหา" : "ยังไม่มีหน่วยสินค้าที่มี Serial"}
                </td>
              </tr>
            )}
            {units.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.serial_number}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {u.product ? (
                    <Link
                      href={`/admin/products/${u.product.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {u.product.name_th}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {u.supplier?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDateTime(u.received_at)}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {u.unit_cost != null ? formatBaht(u.unit_cost) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.status === "in_stock" ? "green" : "gray"}>
                    {UNIT_STATUS_LABELS[u.status]}
                  </Badge>
                  {u.status === "claimed" && u.claimed_at && (
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(u.claimed_at)}
                      {u.claim_note ? ` · ${u.claim_note}` : ""}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.status === "in_stock" && <ClaimUnitButton unitId={u.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
