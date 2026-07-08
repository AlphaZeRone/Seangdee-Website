import { createClient } from "@/lib/supabase/server";
import { deleteSupplier } from "@/lib/actions/suppliers";
import { SupplierForm } from "@/components/admin/supplier-form";
import { Card } from "@/components/ui";
import type { Supplier } from "@/lib/types";

export const metadata = { title: "ผู้จำหน่าย — Seangdee Admin" };

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");
  const suppliers = (data as Supplier[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">ผู้จำหน่าย / Suppliers</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-3 pr-4">ชื่อผู้จำหน่าย</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-400">
                      ยังไม่มีผู้จำหน่าย
                    </td>
                  </tr>
                )}
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {s.name}
                    </td>
                    <td className="py-3 text-right">
                      <form action={deleteSupplier}>
                        <input type="hidden" name="id" value={s.id} />
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
          <h2 className="mb-3 font-semibold text-slate-800">เพิ่มผู้จำหน่าย</h2>
          <SupplierForm />
        </Card>
      </div>
    </div>
  );
}
