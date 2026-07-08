import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card } from "@/components/ui";
import { formatBaht, formatDateTime } from "@/lib/utils";
import { STOCK_REASON_LABELS, type StockReason } from "@/lib/types";

export const metadata = { title: "ภาพรวม — Seangdee Admin" };

interface MovementRow {
  id: string;
  change_qty: number;
  reason: StockReason;
  created_at: string;
  product: { name_th: string } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("quantity, cost_price, reorder_level, status");

  const list = products ?? [];
  const activeCount = list.filter((p) => p.status === "active").length;
  const stockValue = list.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.cost_price),
    0
  );
  const lowStock = list.filter(
    (p) => p.status === "active" && p.quantity <= p.reorder_level
  ).length;
  const outOfStock = list.filter((p) => p.quantity <= 0).length;

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("id, change_qty, reason, created_at, product:products(name_th)")
    .order("created_at", { ascending: false })
    .limit(8);

  const recent = (movements ?? []) as unknown as MovementRow[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">ภาพรวมร้าน</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="สินค้าที่ใช้งาน" value={String(activeCount)} />
        <Stat label="มูลค่าสต๊อก (ทุน)" value={formatBaht(stockValue)} />
        <Stat
          label="สต๊อกต่ำ"
          value={String(lowStock)}
          tone={lowStock > 0 ? "amber" : "gray"}
        />
        <Stat
          label="สินค้าหมด"
          value={String(outOfStock)}
          tone={outOfStock > 0 ? "red" : "gray"}
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            การเคลื่อนไหวสต๊อกล่าสุด
          </h2>
          <Link href="/admin/products" className="text-sm text-indigo-600">
            ดูสินค้าทั้งหมด →
          </Link>
        </div>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-5 py-3">วันที่</th>
              <th className="px-5 py-3">สินค้า</th>
              <th className="px-5 py-3">ประเภท</th>
              <th className="px-5 py-3 text-right">จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  ยังไม่มีการเคลื่อนไหว
                </td>
              </tr>
            )}
            {recent.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="px-5 py-3 text-slate-500">
                  {formatDateTime(m.created_at)}
                </td>
                <td className="px-5 py-3 text-slate-800">
                  {m.product?.name_th ?? "—"}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {STOCK_REASON_LABELS[m.reason]}
                </td>
                <td
                  className={`px-5 py-3 text-right font-medium ${
                    m.change_qty >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {m.change_qty >= 0 ? `+${m.change_qty}` : m.change_qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "gray",
}: {
  label: string;
  value: string;
  tone?: "gray" | "amber" | "red";
}) {
  const valueColor =
    tone === "amber"
      ? "text-amber-600"
      : tone === "red"
        ? "text-red-600"
        : "text-slate-900";
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </Card>
  );
}
