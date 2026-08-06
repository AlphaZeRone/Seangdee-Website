"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home } from "lucide-react";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { logout } from "@/lib/actions/auth";

/** Mobile-only admin header: a hamburger that opens a slide-in nav drawer.
 *  The desktop sidebar (md:flex) is unchanged. */
export function AdminMobileNav({
  isAdmin,
  name,
  role,
}: {
  isAdmin: boolean;
  name: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 md:hidden print:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="เปิดเมนู"
          className="flex items-center gap-2 text-white"
        >
          <Menu className="h-6 w-6" />
          <span className="font-bold">แสงดี · Seangdee</span>
        </button>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-300">
            ออกจากระบบ
          </button>
        </form>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Panel */}
          <div className="absolute left-0 top-0 flex h-full w-64 max-w-[80%] flex-col bg-slate-900 p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <div>
                <p className="text-lg font-bold text-white">แสงดี · Seangdee</p>
                <p className="text-xs text-slate-400">ระบบจัดการสต๊อก</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิดเมนู"
                className="text-slate-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Close the drawer whenever a nav link is tapped */}
            <div onClick={() => setOpen(false)}>
              <SidebarNav isAdmin={isAdmin} />
            </div>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Home className="h-4 w-4" />
              กลับหน้าร้าน
            </Link>

            <div className="mt-auto border-t border-slate-800 pt-4">
              <p className="px-2 text-sm text-slate-300">{name || "ผู้ดูแลระบบ"}</p>
              <p className="mb-2 px-2 text-xs text-slate-500">
                {role === "admin" ? "ผู้ดูแล (admin)" : "พนักงาน (staff)"}
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
          </div>
        </div>
      )}
    </>
  );
}
