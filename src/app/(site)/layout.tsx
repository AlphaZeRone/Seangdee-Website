import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";

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
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-lg font-bold text-slate-900">แสงดี · Seangdee</p>
            <p className="mt-1 text-sm text-slate-500">
              ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ต
            </p>
          </div>
          <div className="text-sm text-slate-500 md:text-right">
            <p>โทร: —</p>
            <p>Line: —</p>
            <p className="mt-2">
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
