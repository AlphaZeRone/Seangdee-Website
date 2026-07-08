import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBaht } from "@/lib/utils";
import { Card } from "@/components/ui";
import { computeRange, bkkYmd, type Period } from "@/lib/period";

export const metadata = { title: "สรุปยอด — Seangdee Admin" };

interface BillRow {
  id: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
}
interface ItemRow {
  name: string;
  quantity: number;
  unit_cost_at_sale: number;
  line_total: number;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "รายวัน" },
  { key: "month", label: "รายเดือน" },
  { key: "year", label: "รายปี" },
];

const hrefFor = (p: Period, date?: string) =>
  `/admin/summary?period=${p}${date ? `&date=${date}` : ""}`;

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const period: Period =
    sp.period === "month" || sp.period === "year" ? sp.period : "day";
  const range = computeRange(period, sp.date);
  const supabase = await createClient();

  const { data: billsData } = await supabase
    .from("bills")
    .select("id, subtotal, vat_amount, total, created_at")
    .is("voided_at", null)
    .gte("created_at", range.startISO)
    .lt("created_at", range.endISO)
    .order("created_at", { ascending: true });
  const bills = (billsData as BillRow[]) ?? [];

  let items: ItemRow[] = [];
  if (bills.length) {
    const { data: itemsData } = await supabase
      .from("bill_items")
      .select("name, quantity, unit_cost_at_sale, line_total")
      .in(
        "bill_id",
        bills.map((b) => b.id)
      );
    items = (itemsData as ItemRow[]) ?? [];
  }

  const salesTotal = bills.reduce((s, b) => s + Number(b.total), 0);
  const base = bills.reduce((s, b) => s + Number(b.subtotal), 0);
  const vatTotal = bills.reduce((s, b) => s + Number(b.vat_amount), 0);
  const cogs = items.reduce(
    (s, i) => s + Number(i.unit_cost_at_sale) * Number(i.quantity),
    0
  );
  const profit = base - cogs;

  // Top products by revenue
  const prodMap = new Map<string, { qty: number; revenue: number }>();
  for (const it of items) {
    const cur = prodMap.get(it.name) ?? { qty: 0, revenue: 0 };
    cur.qty += Number(it.quantity);
    cur.revenue += Number(it.line_total);
    prodMap.set(it.name, cur);
  }
  const topProducts = [...prodMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Breakdown rows
  let breakdown: { label: string; count: number; sales: number; vat: number }[] =
    [];
  if (range.bucket === "bill") {
    const timeFmt = new Intl.DateTimeFormat("th-TH", {
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    });
    breakdown = bills.map((b) => ({
      label: timeFmt.format(new Date(b.created_at)),
      count: 1,
      sales: Number(b.total),
      vat: Number(b.vat_amount),
    }));
  } else {
    const keyOf = (b: BillRow) =>
      range.bucket === "day" ? bkkYmd(b.created_at).d : bkkYmd(b.created_at).m;
    const m = new Map<string, { count: number; sales: number; vat: number }>();
    for (const b of bills) {
      const k = keyOf(b);
      const cur = m.get(k) ?? { count: 0, sales: 0, vat: 0 };
      cur.count += 1;
      cur.sales += Number(b.total);
      cur.vat += Number(b.vat_amount);
      m.set(k, cur);
    }
    breakdown = [...m.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([k, v]) => ({
        label:
          range.bucket === "day" ? `วันที่ ${Number(k)}` : `เดือน ${Number(k)}`,
        ...v,
      }));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">สรุปยอดขาย</h1>

      {/* Period toggle + date nav */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={hrefFor(p.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                period === p.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 text-sm">
          <Link
            href={hrefFor(period, range.prevRef)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            ← ก่อนหน้า
          </Link>
          <span className="min-w-[120px] text-center font-medium text-slate-800">
            {range.label}
          </span>
          <Link
            href={hrefFor(period, range.nextRef)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            ถัดไป →
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="ยอดขายรวม (รวม VAT)" value={formatBaht(salesTotal)} />
        <Stat label="ภาษีมูลค่าเพิ่ม (VAT)" value={formatBaht(vatTotal)} />
        <Stat label="ต้นทุนขาย (COGS)" value={formatBaht(cogs)} />
        <Stat
          label="กำไร (ก่อนภาษี)"
          value={formatBaht(profit)}
          tone={profit >= 0 ? "green" : "red"}
        />
      </div>
      <p className="-mt-4 mb-8 text-sm text-slate-500">
        จำนวนบิล {bills.length} · มูลค่าก่อนภาษี {formatBaht(base)}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breakdown */}
        <Card className="overflow-x-auto p-0">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-800">
            รายละเอียด
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-5 py-3">
                  {range.bucket === "bill" ? "เวลา" : "ช่วง"}
                </th>
                <th className="px-5 py-3 text-center">บิล</th>
                <th className="px-5 py-3 text-right">ยอดขาย</th>
                <th className="px-5 py-3 text-right">VAT</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    ไม่มีการขายในช่วงนี้
                  </td>
                </tr>
              )}
              {breakdown.map((r, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{r.label}</td>
                  <td className="px-5 py-3 text-center text-slate-500">
                    {r.count}
                  </td>
                  <td className="px-5 py-3 text-right">{formatBaht(r.sales)}</td>
                  <td className="px-5 py-3 text-right text-slate-500">
                    {formatBaht(r.vat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Top products */}
        <Card className="overflow-x-auto p-0">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-800">
            สินค้าขายดี
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-5 py-3">สินค้า</th>
                <th className="px-5 py-3 text-center">จำนวน</th>
                <th className="px-5 py-3 text-right">ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                    —
                  </td>
                </tr>
              )}
              {topProducts.map((p) => (
                <tr key={p.name} className="border-b border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{p.name}</td>
                  <td className="px-5 py-3 text-center text-slate-500">
                    {p.qty}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {formatBaht(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
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
  tone?: "gray" | "green" | "red";
}) {
  const color =
    tone === "green"
      ? "text-green-600"
      : tone === "red"
        ? "text-red-600"
        : "text-slate-900";
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}
