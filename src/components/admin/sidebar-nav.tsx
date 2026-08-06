"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Receipt,
  BarChart3,
  Tags,
  Bookmark,
  Truck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { href: "/admin/bills", label: "บิล / ขาย", icon: Receipt },
  { href: "/admin/summary", label: "สรุปยอด", icon: BarChart3 },
  { href: "/admin/products", label: "สินค้า / สต๊อก", icon: Package },
  { href: "/admin/claims", label: "เคลมสินค้า", icon: ShieldCheck },
  { href: "/admin/categories", label: "หมวดหมู่", icon: Tags },
  { href: "/admin/brands", label: "แบรนด์", icon: Bookmark },
  { href: "/admin/suppliers", label: "ผู้จำหน่าย", icon: Truck },
];

// Admin-only entries appended when the signed-in user is an admin.
const adminItems = [
  { href: "/admin/staff", label: "จัดการทีมงาน", icon: Users, exact: false },
];

export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...items, ...adminItems] : items;

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
