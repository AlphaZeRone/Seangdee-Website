import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BillForm } from "@/components/admin/bill-form";
import { Card } from "@/components/ui";
import type { Product } from "@/lib/types";

export const metadata = { title: "ออกบิลใหม่ — Seangdee Admin" };

type SellProduct = Pick<
  Product,
  "id" | "name_th" | "sku" | "sale_price" | "quantity" | "unit"
>;

export default async function NewBillPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name_th, sku, sale_price, quantity, unit")
    .eq("status", "active")
    .order("name_th");

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/bills" className="text-sm text-indigo-600">
          ← กลับไปรายการบิล
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">ออกบิลใหม่</h1>
      </div>
      <Card>
        <BillForm products={(products as SellProduct[]) ?? []} />
      </Card>
    </div>
  );
}
