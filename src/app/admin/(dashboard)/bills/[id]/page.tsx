import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBaht, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui";
import { PrintButton } from "@/components/admin/print-button";
import { DownloadPdfButton } from "@/components/admin/download-pdf-button";
import { VoidBillButton } from "@/components/admin/void-bill-button";
import { SHOP } from "@/lib/shop";
import type { Bill, BillItem } from "@/lib/types";

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bill } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single<Bill>();
  if (!bill) notFound();

  const { data: itemsData } = await supabase
    .from("bill_items")
    .select("*")
    .eq("bill_id", id)
    .order("created_at");
  const items = (itemsData as BillItem[]) ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/bills" className="text-sm text-indigo-600">
          ← กลับไปรายการบิล
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {!bill.voided_at && (
            <Link href={`/admin/bills/${bill.id}/edit`}>
              <Button variant="secondary">แก้ไข</Button>
            </Link>
          )}
          <PrintButton />
          <DownloadPdfButton targetId="receipt" fileName={bill.bill_no} />
          {!bill.voided_at && <VoidBillButton billId={bill.id} />}
        </div>
      </div>

      {bill.voided_at && (
        <div className="mx-auto mb-4 max-w-2xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 print:hidden">
          <span className="font-semibold">บิลนี้ถูกยกเลิกแล้ว</span> เมื่อ{" "}
          {formatDateTime(bill.voided_at)} — สต๊อกถูกคืนกลับคลังและไม่นับรวมในสรุปยอดขาย
          {bill.void_reason && (
            <span className="block text-red-600">เหตุผล: {bill.void_reason}</span>
          )}
        </div>
      )}

      <div
        id="receipt"
        className="relative mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none"
      >
        {bill.voided_at && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-20deg] rounded-lg border-4 border-red-500/70 px-6 py-2 text-4xl font-extrabold tracking-widest text-red-500/70">
              ยกเลิก / VOID
            </span>
          </div>
        )}
        {/* Seller / title */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{SHOP.name_th}</h1>
            <p className="text-sm text-slate-500">{SHOP.name_en}</p>
            <p className="mt-1 text-xs text-slate-500">{SHOP.address}</p>
            <p className="text-xs text-slate-500">โทร {SHOP.phone}</p>
            {SHOP.tax_id && (
              <p className="text-xs text-slate-500">เลขผู้เสียภาษี {SHOP.tax_id}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900">ใบเสร็จรับเงิน</p>
            <p className="text-xs text-slate-500">Receipt</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              เลขที่ {bill.bill_no}
            </p>
            <p className="text-xs text-slate-500">
              {formatDateTime(bill.created_at)}
            </p>
          </div>
        </div>

        {/* Customer */}
        {(bill.customer_name ||
          bill.customer_phone ||
          bill.customer_address ||
          bill.customer_tax_id) && (
          <div className="border-b border-slate-200 py-4 text-sm">
            <p className="text-xs uppercase text-slate-400">ลูกค้า</p>
            {bill.customer_name && (
              <p className="text-slate-800">{bill.customer_name}</p>
            )}
            {bill.customer_address && (
              <p className="text-slate-600">{bill.customer_address}</p>
            )}
            <p className="text-slate-600">
              {bill.customer_phone && <span>โทร {bill.customer_phone} </span>}
              {bill.customer_tax_id && (
                <span>· เลขผู้เสียภาษี {bill.customer_tax_id}</span>
              )}
            </p>
          </div>
        )}

        {/* Items */}
        <table className="my-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2">รายการ</th>
              <th className="py-2 text-center">จำนวน</th>
              <th className="py-2 text-right">ราคา/หน่วย</th>
              <th className="py-2 text-right">รวม</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="py-2">
                  <p className="text-slate-800">{it.name}</p>
                  {it.sku && <p className="text-xs text-slate-400">{it.sku}</p>}
                </td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">{formatBaht(it.unit_price)}</td>
                <td className="py-2 text-right">{formatBaht(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between border-t border-slate-300 pt-1 text-base font-bold text-slate-900">
            <span>รวมทั้งสิ้น</span>
            <span>{formatBaht(bill.total)}</span>
          </div>
        </div>

        {bill.note && (
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            หมายเหตุ: {bill.note}
          </p>
        )}

        <div className="mt-10 flex justify-between text-center text-xs text-slate-500">
          <div className="w-40 border-t border-slate-300 pt-1">ผู้รับเงิน</div>
          <div className="w-40 border-t border-slate-300 pt-1">ผู้รับสินค้า</div>
        </div>
      </div>
    </div>
  );
}
