import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setProductStatus } from "@/lib/actions/products";
import { AddStockForm } from "@/components/admin/add-stock-form";
import { DeleteMovementButton } from "@/components/admin/delete-movement-button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Badge, Button, Card } from "@/components/ui";
import { formatBaht, formatDateTime } from "@/lib/utils";
import {
  STOCK_REASON_LABELS,
  type ProductWithCategory,
  type StockMovement,
} from "@/lib/types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "*, category:categories(id,name_th,name_en,type), brand:brands(id,name), supplier:suppliers(id,name)"
    )
    .eq("id", id)
    .single<ProductWithCategory>();

  if (!product) notFound();

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const history = (movements as StockMovement[]) ?? [];
  const low = product.quantity <= product.reorder_level;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-sm text-indigo-600">
            ← กลับไปรายการสินค้า
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {product.name_th}
          </h1>
          <p className="text-sm text-slate-500">
            {product.name_en} · SKU {product.sku}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="secondary">แก้ไข</Button>
          </Link>
          <form action={setProductStatus}>
            <input type="hidden" name="id" value={product.id} />
            <input
              type="hidden"
              name="status"
              value={product.status === "active" ? "inactive" : "active"}
            />
            <Button variant="ghost" type="submit">
              {product.status === "active" ? "ปิดการขาย" : "เปิดการขาย"}
            </Button>
          </form>
          <DeleteProductButton
            productId={product.id}
            productName={product.name_th}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name_th}
              className="mb-4 aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              ไม่มีรูป
            </div>
          )}
          <dl className="space-y-2 text-sm">
            <Row label="หมวดหมู่" value={product.category?.name_th ?? "—"} />
            <Row label="แบรนด์" value={product.brand?.name ?? "—"} />
            <Row label="ผู้จำหน่าย" value={product.supplier?.name ?? "—"} />
            <Row label="บาร์โค้ด" value={product.barcode ?? "—"} />
            <Row label="ราคาทุนเฉลี่ย" value={formatBaht(product.cost_price)} />
            <Row label="ราคาขาย" value={formatBaht(product.sale_price)} />
            <Row label="จุดสั่งซื้อ" value={`${product.reorder_level} ${product.unit}`} />
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-500">คงเหลือ</dt>
              <dd className="font-semibold">
                <span className={low ? "text-amber-600" : "text-slate-900"}>
                  {product.quantity} {product.unit}
                </span>
                {low && (
                  <Badge tone="amber" className="ml-2">
                    สต๊อกต่ำ
                  </Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 font-semibold text-slate-800">
              บันทึกการเคลื่อนไหวสต๊อก
            </h2>
            <AddStockForm productId={product.id} />
          </Card>

          <Card className="overflow-x-auto p-0">
            <h2 className="border-b border-slate-100 px-5 py-4 font-semibold text-slate-800">
              ประวัติสต๊อก
            </h2>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-5 py-3">วันที่</th>
                  <th className="px-5 py-3">ประเภท</th>
                  <th className="px-5 py-3 text-right">จำนวน</th>
                  <th className="px-5 py-3">หมายเหตุ</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      ยังไม่มีประวัติการเคลื่อนไหว
                    </td>
                  </tr>
                )}
                {history.map((m) => {
                  // Billing-owned movements (sales, void-returns) can't be deleted
                  // here — the bill must be voided instead.
                  const billing =
                    m.reason === "sale" || (m.note?.startsWith("INV-") ?? false);
                  return (
                    <tr key={m.id} className="border-b border-slate-100">
                      <td className="px-5 py-3 text-slate-500">
                        {formatDateTime(m.created_at)}
                      </td>
                      <td className="px-5 py-3">{STOCK_REASON_LABELS[m.reason]}</td>
                      <td
                        className={`px-5 py-3 text-right font-medium ${
                          m.change_qty >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {m.change_qty >= 0 ? `+${m.change_qty}` : m.change_qty}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{m.note ?? "—"}</td>
                      <td className="px-5 py-3 text-right">
                        {billing ? (
                          <span className="text-xs text-slate-300">จากบิล</span>
                        ) : (
                          <DeleteMovementButton
                            movementId={m.id}
                            productId={product.id}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}
