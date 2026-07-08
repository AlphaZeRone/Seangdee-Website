import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBaht, formatDateTime } from "@/lib/utils";
import { Badge, Button, Card, Input } from "@/components/ui";
import type { Bill } from "@/lib/types";

export const metadata = { title: "บิล / ขาย — Seangdee Admin" };

type BillWithCreator = Bill & { creator_name: string | null };

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("bills_with_creator")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    // Strip PostgREST filter metacharacters before interpolating into .or().
    const term = q.replace(/[,()%]/g, " ").trim();
    if (term) {
      query = query.or(
        `bill_no.ilike.%${term}%,customer_name.ilike.%${term}%,creator_name.ilike.%${term}%`
      );
    }
  }

  const { data } = await query;
  const bills = (data as BillWithCreator[]) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">บิล / การขาย</h1>
        <Link href="/admin/bills/new">
          <Button>+ ออกบิลใหม่</Button>
        </Link>
      </div>

      {/* Search */}
      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <div className="min-w-[240px] grow sm:grow-0 sm:basis-80">
          <Input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาด้วยชื่อลูกค้า, พนักงาน หรือเลขที่บิล…"
          />
        </div>
        <Button type="submit" variant="secondary">
          ค้นหา
        </Button>
        {q && (
          <Link href="/admin/bills" className="text-sm text-indigo-600">
            ล้าง
          </Link>
        )}
      </form>

      {q && (
        <p className="mb-3 text-sm text-slate-500">
          ผลการค้นหา “{q}” — {bills.length} รายการ
        </p>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">เลขที่บิล</th>
              <th className="px-4 py-3">วันที่</th>
              <th className="px-4 py-3">ลูกค้า</th>
              <th className="px-4 py-3">พนักงาน</th>
              <th className="px-4 py-3">ประเภท</th>
              <th className="px-4 py-3 text-right">VAT</th>
              <th className="px-4 py-3 text-right">รวมทั้งสิ้น</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  {q
                    ? "ไม่พบบิลที่ตรงกับคำค้นหา"
                    : "ยังไม่มีบิล — กด “ออกบิลใหม่” เพื่อเริ่มขาย"}
                </td>
              </tr>
            )}
            {bills.map((b) => {
              const voided = Boolean(b.voided_at);
              return (
                <tr
                  key={b.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    voided ? "bg-slate-50/60 text-slate-400" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bills/${b.id}`}
                      className={`font-medium ${
                        voided ? "text-slate-400 line-through" : "text-indigo-600"
                      }`}
                    >
                      {b.bill_no}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(b.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {b.customer_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.creator_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {voided ? (
                      <Badge tone="red">ยกเลิก</Badge>
                    ) : b.is_tax_invoice ? (
                      <Badge tone="indigo">ใบกำกับภาษี</Badge>
                    ) : (
                      <Badge tone="gray">ใบเสร็จ</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {formatBaht(b.vat_amount)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      voided ? "line-through" : ""
                    }`}
                  >
                    {formatBaht(b.total)}
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
