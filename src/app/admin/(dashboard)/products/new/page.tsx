import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { Card } from "@/components/ui";
import type { Brand, Category, Supplier } from "@/lib/types";

export const metadata = { title: "เพิ่มสินค้า — Seangdee Admin" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }, { data: suppliers }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name_th"),
      supabase.from("brands").select("*").order("name"),
      supabase.from("suppliers").select("*").order("name"),
    ]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-indigo-600">
          ← กลับไปรายการสินค้า
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">เพิ่มสินค้าใหม่</h1>
      </div>
      <Card>
        <ProductForm
          categories={(categories as Category[]) ?? []}
          brands={(brands as Brand[]) ?? []}
          suppliers={(suppliers as Supplier[]) ?? []}
          action={createProduct}
          submitLabel="บันทึกสินค้า"
        />
      </Card>
    </div>
  );
}
