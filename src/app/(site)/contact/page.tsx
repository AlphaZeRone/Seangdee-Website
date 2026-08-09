import Link from "next/link";
import {
  SHOP,
  OPENING_HOURS,
  MAP_EMBED_URL,
  MAP_LINK_URL,
  TEL_HREF,
  LINE_URL,
} from "@/lib/shop";

export const metadata = {
  title: "ติดต่อเรา — Seangdee",
  description: `ติดต่อร้านแสงดี โทร ${SHOP.phone} · ${SHOP.address} · ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ต`,
};

/** Quick-contact tiles — the primary way customers reach the shop. */
const channels = [
  {
    icon: "📞",
    label: "โทรศัพท์",
    value: SHOP.phone,
    href: TEL_HREF,
    hint: "สอบถามสินค้า เช็คสต็อก สั่งซื้อ",
  },
  {
    icon: "💬",
    label: "LINE",
    value: SHOP.line_id,
    href: LINE_URL,
    hint: "ทักแชทเพื่อขอรูปสินค้า/ใบเสนอราคา",
  },
  ...(SHOP.email
    ? [
        {
          icon: "✉️",
          label: "อีเมล",
          value: SHOP.email,
          href: `mailto:${SHOP.email}`,
          hint: "สำหรับติดต่อเรื่องเอกสาร/ใบกำกับภาษี",
        },
      ]
    : []),
];

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-8 md:py-16">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            ติดต่อเรา
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            สอบถามสินค้า หรือแวะที่ร้าน
          </h1>
          <p className="mt-4 text-base text-slate-600">
            ทีมงานยินดีช่วยเลือกรุ่นที่เหมาะกับการใช้งานของคุณ
            โทรหรือทักไลน์มาได้ในเวลาทำการ
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        {/* Quick-contact channels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="text-3xl">{c.icon}</div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                {c.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
                {c.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{c.hint}</p>
            </a>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Address + hours */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">ที่ตั้งร้าน</h2>
            <address className="mt-3 not-italic leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-900">
                {SHOP.name_th} · {SHOP.name_en}
              </p>
              <p className="mt-1">{SHOP.address}</p>
            </address>
            <a
              href={MAP_LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              🧭 เปิดใน Google Maps
            </a>

            <h2 className="mt-10 text-xl font-bold text-slate-900">เวลาทำการ</h2>
            <dl className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {OPENING_HOURS.map((row) => {
                const closed = row.hours.includes("ปิด");
                return (
                  <div
                    key={row.days}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                  >
                    <dt className="text-slate-600">{row.days}</dt>
                    <dd
                      className={
                        closed
                          ? "font-medium text-slate-400"
                          : "font-medium text-slate-900"
                      }
                    >
                      {row.hours}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-3 text-xs text-slate-400">
              * วันหยุดนักขัตฤกษ์อาจมีการเปลี่ยนแปลง แนะนำให้โทรสอบถามก่อนเดินทาง
            </p>
          </div>

          {/* Map */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">แผนที่</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <iframe
                src={MAP_EMBED_URL}
                title={`แผนที่ ${SHOP.name_th}`}
                className="h-[360px] w-full border-0 lg:h-[430px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Before you come */}
        <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900">ก่อนมาที่ร้าน</h2>
          <div className="mt-4 grid gap-6 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-800">เช็คสต็อกก่อน</p>
              <p className="mt-1 leading-relaxed">
                หน้า
                <Link
                  href="/products"
                  className="mx-1 font-medium text-indigo-600 hover:underline"
                >
                  สินค้า
                </Link>
                แสดงสถานะสต็อกจากระบบจริง แต่โทรยืนยันอีกครั้งจะชัวร์ที่สุด
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">มาเคลมสินค้า</p>
              <p className="mt-1 leading-relaxed">
                เตรียมตัวสินค้าและหมายเลขซีเรียลมาด้วย
                เราตรวจสอบสิทธิ์การรับประกันจากซีเรียลในระบบให้ได้ทันที
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">ต้องการใบกำกับภาษี</p>
              <p className="mt-1 leading-relaxed">
                แจ้งชื่อบริษัท ที่อยู่ และเลขประจำตัวผู้เสียภาษีตอนสั่งซื้อ
                เพื่อให้เราออกเอกสารได้ถูกต้อง
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={TEL_HREF}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
          >
            📞 โทร {SHOP.phone}
          </a>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            💬 ทักไลน์ {SHOP.line_id}
          </a>
        </div>
      </div>
    </main>
  );
}
