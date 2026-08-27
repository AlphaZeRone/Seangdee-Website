import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SHOP, BRANCHES, TEL_HREF } from "@/lib/shop";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <div className="flex-1">{children}</div>

      <footer id="contact" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
          <div>
            <p className="text-lg font-bold text-slate-900">แสงดี · Seangdee</p>
            <p className="mt-1 text-sm text-slate-500">{SHOP.tagline_th}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-500">
              {BRANCHES.map((b) => (
                <li key={b.id}>
                  <span className="font-medium text-slate-700">
                    สาขา{b.short_th}
                  </span>
                  <br />
                  {b.address}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-slate-900">เมนู</p>
            <ul className="mt-2 space-y-1.5 text-slate-500">
              <li>
                <Link href="/products" className="hover:text-slate-900">
                  สินค้า
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900">
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-slate-900">ติดต่อ</p>
            <ul className="mt-2 space-y-1.5 text-slate-500">
              <li>
                โทร:{" "}
                <a href={TEL_HREF} className="hover:text-slate-900">
                  {SHOP.phone}
                </a>
              </li>
              <li>
                LINE:{" "}
                <span className="text-slate-700">{SHOP.line_id}</span>{" "}
                <span className="text-xs text-slate-400">(แอดด้วยเบอร์)</span>
              </li>
              {SHOP.email && (
                <li>
                  อีเมล:{" "}
                  <a href={`mailto:${SHOP.email}`} className="hover:text-slate-900">
                    {SHOP.email}
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-4">
              <Link href="/admin" className="text-slate-400 hover:text-slate-600">
                เข้าสู่ระบบจัดการ (พนักงาน)
              </Link>
            </p>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Seangdee
        </p>
      </footer>
    </div>
  );
}
