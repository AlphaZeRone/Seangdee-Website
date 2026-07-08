import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillForm, type BillFormInitial } from "@/components/admin/bill-form";
import { Card } from "@/components/ui";
import type { Bill, BillItem, Product } from "@/lib/types";

export const metadata = { title: "แก้ไขบิล — Seangdee Admin" };

type SellProduct = Pick<
  Product,
  "id" | "name_th" | "sku" | "sale_price" | "quantity" | "unit"
>;

export default async function EditBillPage({
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
  // Voided bills are immutable — send back to the (read-only) detail view.
  if (bill.voided_at) redirect(`/admin/bills/${id}`);

  const { data: itemsData } = await supabase
    .from("bill_items")
    .select("*")
    .eq("bill_id", id)
    .order("created_at");
  const items = (itemsData as BillItem[]) ?? [];

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name_th, sku, sale_price, quantity, unit")
    .eq("status", "active")
    .order("name_th");
  const products = (productsData as SellProduct[]) ?? [];

  // Make sure every current line renders even if its product is now inactive or
  // deleted — reconstruct a picker entry from the saved snapshot.
  const known = new Set(products.map((p) => p.id));
  for (const it of items) {
    if (it.product_id && !known.has(it.product_id)) {
      products.push({
        id: it.product_id,
        name_th: it.name,
        sku: it.sku ?? "",
        sale_price: it.unit_price,
        quantity: it.quantity, // best-effort; server re-checks real stock
        unit: "",
      });
      known.add(it.product_id);
    }
  }

  const initial: BillFormInitial = {
    billId: bill.id,
    isTax: bill.is_tax_invoice,
    customer_name: bill.customer_name ?? "",
    customer_phone: bill.customer_phone ?? "",
    customer_address: bill.customer_address ?? "",
    customer_tax_id: bill.customer_tax_id ?? "",
    note: bill.note ?? "",
    lines: items
      .filter((it) => it.product_id)
      .map((it) => ({ product_id: it.product_id as string, quantity: it.quantity })),
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/bills/${bill.id}`} className="text-sm text-indigo-600">
          ← กลับไปหน้าบิล
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          แก้ไขบิล {bill.bill_no}
        </h1>
        <p className="text-sm text-slate-500">
          การแก้ไขจะคืนสต๊อกเดิมและตัดสต๊อกใหม่ พร้อมคำนวณ VAT ใหม่โดยอัตโนมัติ
        </p>
      </div>
      <Card>
        <BillForm products={products} initial={initial} />
      </Card>
    </div>
  );
}
