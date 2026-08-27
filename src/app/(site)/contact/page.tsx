import Link from "next/link";
import { SHOP, BRANCHES, TEL_HREF, telHref } from "@/lib/shop";

export const metadata = {
  title: "ติดต่อเรา — Seangdee",
  description: `ติดต่อร้านแสงดี โทร ${SHOP.phone} · มี 2 สาขา บางเขน (กรุงเทพฯ) และนนทบุรี · ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ต`,
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
    href: null,
    hint: "แอดไลน์ด้วยเบอร์นี้เพื่อขอรูปสินค้า/ใบเสนอราคา",
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
            เรามี {BRANCHES.length} สาขา —{" "}
            {BRANCHES.map((b) => b.short_th).join(" และ ")}{" "}
            ทีมงานยินดีช่วยเลือกรุ่นที่เหมาะกับการใช้งานของคุณ
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        {/* Quick-contact channels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => {
            const cardClass =
              "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition" +
              (c.href
                ? " hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                : "");
            const inner = (
              <>
                <div className="text-3xl">{c.icon}</div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {c.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
                  {c.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{c.hint}</p>
              </>
            );
            return c.href ? (
              <a key={c.label} href={c.href} className={cardClass}>
                {inner}
              </a>
            ) : (
              <div key={c.label} className={cardClass}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Branches */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-900">สาขาของเรา</h2>
          <p className="mt-1 text-sm text-slate-500">
            แวะเลือกสินค้าได้ที่หน้าร้านทั้ง {BRANCHES.length} สาขา
          </p>

          <div className="mt-8 space-y-10">
            {BRANCHES.map((branch, i) => (
              <div
                key={branch.id}
                id={branch.id}
                className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-6"
              >
                {/* Details */}
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {branch.name_th}
                    </h3>
                    {i === 0 && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        สาขาหลัก
                      </span>
                    )}
                  </div>

                  <address className="mt-3 not-italic leading-relaxed text-slate-600">
                    {branch.address}
                  </address>

                  {branch.note && (
                    <p className="mt-2 text-sm text-slate-500">{branch.note}</p>
                  )}

                  <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <dt className="text-slate-500">โทร</dt>
                      <dd>
                        <a
                          href={telHref(branch.phone)}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {branch.phone}
                        </a>
                      </dd>
                    </div>
                    {branch.hours.map((row) => {
                      const closed = row.hours.includes("ปิด");
                      return (
                        <div
                          key={row.days}
                          className="flex items-center justify-between px-4 py-2.5 text-sm"
                        >
                          <dt className="text-slate-500">{row.days}</dt>
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={branch.map_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      🧭 นำทางไปสาขานี้
                    </a>
                    <a
                      href={telHref(branch.phone)}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      📞 โทรหาสาขานี้
                    </a>
                  </div>
                </div>

                {/* Map */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <iframe
                    src={branch.map_embed_url}
                    title={`แผนที่ ${branch.name_th}`}
                    className="h-[280px] w-full border-0 md:h-full md:min-h-[320px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            * วันหยุดนักขัตฤกษ์อาจมีการเปลี่ยนแปลง
            แนะนำให้โทรสอบถามสาขาที่จะไปก่อนเดินทาง
          </p>
        </section>

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
                แสดงสถานะสต็อกจากระบบจริง แต่โทรยืนยันกับสาขาที่จะไปอีกครั้งจะชัวร์ที่สุด
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
          <div className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 sm:w-auto">
            💬 LINE: {SHOP.line_id} (แอดด้วยเบอร์)
          </div>
        </div>
      </div>
    </main>
  );
}
