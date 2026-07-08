import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { Badge, Card } from "@/components/ui";
import { CATEGORY_TYPE_LABELS, type Category } from "@/lib/types";

export const metadata = { title: "หมวดหมู่ — Seangdee Admin" };

const TYPE_TONE = {
  cctv: "indigo",
  internet: "green",
  accessory: "gray",
} as const;

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name_th");

  const categories = (data as Category[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">หมวดหมู่สินค้า</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 lg:order-1 lg:col-start-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-3 pr-4">ชื่อ</th>
                  <th className="py-3 pr-4">Slug</th>
                  <th className="py-3 pr-4">ประเภท</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      ยังไม่มีหมวดหมู่
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{c.name_th}</p>
                      <p className="text-xs text-slate-400">{c.name_en}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{c.slug}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={TYPE_TONE[c.type]}>
                        {CATEGORY_TYPE_LABELS[c.type]}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:order-2">
          <h2 className="mb-3 font-semibold text-slate-800">เพิ่มหมวดหมู่</h2>
          <CategoryForm />
        </Card>
      </div>
    </div>
  );
}
