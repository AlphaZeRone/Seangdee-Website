import { requireStaff } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 p-4 md:flex print:!hidden">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold text-white">แสงดี · Seangdee</p>
          <p className="text-xs text-slate-400">ระบบจัดการสต๊อก</p>
        </div>

        <SidebarNav />

        <div className="mt-auto border-t border-slate-800 pt-4">
          <p className="px-2 text-sm text-slate-300">
            {profile.full_name || "ผู้ดูแลระบบ"}
          </p>
          <p className="mb-2 px-2 text-xs text-slate-500">
            {profile.role === "admin" ? "ผู้ดูแล (admin)" : "พนักงาน (staff)"}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between bg-slate-900 px-4 py-3 md:hidden print:hidden">
          <span className="font-bold text-white">แสงดี · Seangdee</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-300">
              ออกจากระบบ
            </button>
          </form>
        </header>

        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
