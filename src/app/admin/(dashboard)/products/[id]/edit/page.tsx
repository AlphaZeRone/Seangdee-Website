import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { Card } from "@/components/ui";
import type { Brand, Category, Product, Supplier } from "@/lib/types";

export const metadata = { title: "แก้ไขสินค้า — Seangdee Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: product },
    { data: categories },
    { data: brands },
    { data: suppliers },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single<Product>(),
    supabase.from("categories").select("*").order("name_th"),
    supabase.from("brands").select("*").order("name"),
    supabase.from("suppliers").select("*").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/products/${id}`} className="text-sm text-indigo-600">
          ← กลับไปหน้าสินค้า
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          แก้ไข: {product.name_th}
        </h1>
      </div>
      <Card>
        <ProductForm
          categories={(categories as Category[]) ?? []}
          brands={(brands as Brand[]) ?? []}
          suppliers={(suppliers as Supplier[]) ?? []}
          product={product}
          action={updateProduct}
          submitLabel="บันทึกการแก้ไข"
        />
      </Card>
    </div>
  );
}
