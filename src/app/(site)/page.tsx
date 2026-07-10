import Link from "next/link";

const services = [
  {
    icon: "📹",
    title: "กล้องวงจรปิด CCTV",
    desc: "จำหน่ายและติดตั้งกล้องวงจรปิดคมชัด ดูผ่านมือถือได้ พร้อมรับประกันงานติดตั้ง",
  },
  {
    icon: "🌐",
    title: "อินเทอร์เน็ต",
    desc: "ติดตั้งและวางระบบเครือข่ายอินเทอร์เน็ต สำหรับบ้านและร้านค้า สัญญาณเสถียร",
  },
  {
    icon: "🛠️",
    title: "บริการหลังการขาย",
    desc: "ดูแล ซ่อมบำรุง และรับเคลมสินค้าตามหมายเลขซีเรียล อุ่นใจตลอดการใช้งาน",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-8 md:py-28">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            CCTV &amp; Internet · ครบจบที่เดียว
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            กล้องวงจรปิดและอินเทอร์เน็ต
            <br />
            <span className="text-indigo-600">โดยทีมงานแสงดี</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600">
            จำหน่าย ติดตั้ง และดูแลระบบกล้องวงจรปิดและอินเทอร์เน็ต
            พร้อมบริการหลังการขายและการรับประกันที่ไว้ใจได้
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              สมัครสมาชิก
            </Link>
            <a
              href="#services"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ดูบริการของเรา
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          บริการของเรา
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          ดูแลครบตั้งแต่เลือกสินค้า ติดตั้ง จนถึงหลังการขาย
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:px-8">
          <h2 className="text-2xl font-bold text-white">
            พร้อมติดตั้งระบบของคุณแล้วหรือยัง?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            สมัครสมาชิกเพื่อรับข่าวสารและบริการหลังการขายจากเรา
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-400"
          >
            เริ่มต้นใช้งาน
          </Link>
        </div>
      </section>
    </main>
  );
}
