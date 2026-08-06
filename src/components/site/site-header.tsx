import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { customerLogout } from "@/lib/actions/customer-auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-slate-900">แสงดี · Seangdee</span>
          <span className="text-[11px] text-slate-400">
            กล้องวงจรปิด &amp; อินเทอร์เน็ต
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/products" className="hover:text-slate-900">
            สินค้า
          </Link>
          <a href="/#services" className="hover:text-slate-900">
            บริการ
          </a>
          <a href="/#contact" className="hover:text-slate-900">
            ติดต่อเรา
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/account"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                บัญชีของฉัน
              </Link>
              <form action={customerLogout}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
                >
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
