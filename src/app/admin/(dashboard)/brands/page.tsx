import { createClient } from "@/lib/supabase/server";
import { deleteBrand } from "@/lib/actions/brands";
import { BrandForm } from "@/components/admin/brand-form";
import { Card } from "@/components/ui";
import type { Brand } from "@/lib/types";

export const metadata = { title: "แบรนด์ — Seangdee Admin" };

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("name");
  const brands = (data as Brand[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">แบรนด์สินค้า</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-3 pr-4">ชื่อแบรนด์</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-400">
                      ยังไม่มีแบรนด์
                    </td>
                  </tr>
                )}
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {b.name}
                    </td>
                    <td className="py-3 text-right">
                      <form action={deleteBrand}>
                        <input type="hidden" name="id" value={b.id} />
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

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">เพิ่มแบรนด์</h2>
          <BrandForm />
        </Card>
      </div>
    </div>
  );
}
