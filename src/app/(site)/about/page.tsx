import Link from "next/link";
import { SHOP, TEL_HREF } from "@/lib/shop";

export const metadata = {
  title: "เกี่ยวกับเรา — Seangdee",
  description:
    "ร้านแสงดี ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตหลากหลายรุ่น พร้อมบริการหลังการขายและการรับประกันตามหมายเลขซีเรียล",
};

const values = [
  {
    icon: "🏷️",
    title: "สินค้าของแท้ ราคาตรงไปตรงมา",
    desc: "เราจำหน่ายเฉพาะสินค้าของแท้จากตัวแทนจำหน่าย แจ้งราคาชัดเจนก่อนตัดสินใจ ไม่มีค่าใช้จ่ายแอบแฝง",
  },
  {
    icon: "🔎",
    title: "ช่วยเลือกรุ่นให้เหมาะกับงาน",
    desc: "บอกเราว่าจะใช้ที่บ้าน ร้านค้า หรือโกดัง ทีมงานช่วยแนะนำรุ่นและสเปกที่คุ้มค่าที่สุดสำหรับงบของคุณ",
  },
  {
    icon: "🛡️",
    title: "รับประกันตามหมายเลขซีเรียล",
    desc: "สินค้าทุกชิ้นบันทึกหมายเลขซีเรียลไว้ในระบบ ตรวจสอบสิทธิ์การรับประกันและส่งเคลมได้สะดวก ไม่ต้องกังวลว่าใบเสร็จหาย",
  },
  {
    icon: "📦",
    title: "มีสต็อกพร้อมจำหน่าย",
    desc: "สินค้าที่แสดงบนหน้าเว็บอัปเดตสถานะจากสต็อกจริงของร้าน เห็นว่ามีของ คือมีของพร้อมรับได้ทันที",
  },
];

const steps = [
  {
    no: "1",
    title: "เลือกดูสินค้า",
    desc: "เลือกดูกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ตได้จากหน้าสินค้า พร้อมราคาและสถานะสต็อก",
  },
  {
    no: "2",
    title: "สอบถาม / สั่งซื้อ",
    desc: "โทรหรือทักไลน์มาสอบถามได้ ทีมงานช่วยยืนยันสเปกและความพร้อมของสินค้าให้",
  },
  {
    no: "3",
    title: "รับสินค้า + รับประกัน",
    desc: "รับสินค้าพร้อมใบเสร็จ หมายเลขซีเรียลถูกบันทึกไว้ในระบบเพื่อใช้เคลมภายหลัง",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8 md:py-20">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            เกี่ยวกับเรา
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            ร้านจำหน่ายกล้องวงจรปิด
            <br />
            และอุปกรณ์อินเทอร์เน็ต
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            {SHOP.name_th} คือร้านจำหน่ายอุปกรณ์กล้องวงจรปิดและอุปกรณ์เครือข่ายอินเทอร์เน็ต
            สำหรับบ้าน ร้านค้า และธุรกิจขนาดเล็ก
            เราคัดสินค้าของแท้หลากหลายรุ่นมาไว้ให้เลือก
            พร้อมดูแลเรื่องการรับประกันและการเคลมหลังการขาย
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <h2 className="text-2xl font-bold text-slate-900">เรื่องราวของเรา</h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
          <p>
            {/* TODO(owner): แก้ข้อความส่วนนี้ให้ตรงกับเรื่องราวจริงของร้าน */}
            เราเปิดร้านตั้งแต่ปี พ.ศ. {SHOP.established_year} ด้วยความตั้งใจง่าย ๆ
            คืออยากให้คนทั่วไปเข้าถึงอุปกรณ์กล้องวงจรปิดและอินเทอร์เน็ตคุณภาพดี
            ในราคาที่จับต้องได้ โดยไม่ต้องเป็นช่างเทคนิคถึงจะเลือกของเป็น
          </p>
          <p>
            ตลอดเวลาที่ผ่านมา เราให้ความสำคัญกับสองเรื่อง คือ{" "}
            <strong className="font-semibold text-slate-800">ของต้องแท้</strong> และ{" "}
            <strong className="font-semibold text-slate-800">
              ขายแล้วต้องดูแลต่อ
            </strong>{" "}
            สินค้าทุกชิ้นที่ผ่านร้านเราถูกบันทึกหมายเลขซีเรียลไว้ในระบบ
            เพื่อให้ลูกค้าตรวจสอบสิทธิ์การรับประกันและส่งเคลมได้ง่าย
            แม้ใบเสร็จจะหายไปแล้วก็ตาม
          </p>
        </div>

        {/* Positioning note — Seangdee sells equipment, it does not install. */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-semibold text-amber-900">
            สิ่งที่เราให้บริการ และไม่ให้บริการ
          </h3>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium text-amber-900">✓ เราจำหน่าย</p>
              <ul className="mt-1.5 space-y-1 text-amber-800">
                <li>• กล้องวงจรปิดและอุปกรณ์ที่เกี่ยวข้อง</li>
                <li>• อุปกรณ์เครือข่าย / อินเทอร์เน็ต</li>
                <li>• อุปกรณ์เสริมและอะไหล่</li>
                <li>• บริการรับเคลมตามการรับประกัน</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-amber-900">✗ เรายังไม่มีบริการ</p>
              <ul className="mt-1.5 space-y-1 text-amber-800">
                <li>• รับติดตั้งหรือเดินสายนอกสถานที่</li>
                <li>• ให้บริการอินเทอร์เน็ต (ISP)</li>
              </ul>
              <p className="mt-2 text-xs text-amber-700">
                หากต้องการช่างติดตั้ง สอบถามเราได้ ยินดีให้คำแนะนำเบื้องต้น
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            ทำไมต้องซื้อกับแสงดี
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl">{v.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to buy */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          ซื้อสินค้ากับเราอย่างไร
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          ขั้นตอนง่าย ๆ เพียง 3 ขั้นตอน
        </p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.no}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {s.no}
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:px-8">
          <h2 className="text-2xl font-bold text-white">
            พร้อมช่วยคุณเลือกสินค้าที่ใช่
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            ดูสินค้าที่มีจำหน่าย หรือโทรสอบถามทีมงานได้เลย
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-400"
            >
              ดูสินค้าทั้งหมด
            </Link>
            <a
              href={TEL_HREF}
              className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              📞 โทร {SHOP.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
