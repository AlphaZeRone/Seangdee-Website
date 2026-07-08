import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">แสงดี · Seangdee</h1>
        <p className="mt-2 text-slate-500">
          ร้านกล้องวงจรปิดและอินเทอร์เน็ต · CCTV &amp; Internet shop
        </p>
      </div>
      <p className="max-w-md text-sm text-slate-400">
        เว็บไซต์สำหรับลูกค้ากำลังอยู่ระหว่างการพัฒนา · Customer site coming soon.
      </p>
      <Link
        href="/admin"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        เข้าสู่ระบบจัดการ (Admin)
      </Link>
    </main>
  );
}
