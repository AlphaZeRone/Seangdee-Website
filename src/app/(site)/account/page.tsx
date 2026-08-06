import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerLogout } from "@/lib/actions/customer-auth";
import { formatPhoneTH } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export const metadata = { title: "บัญชีของฉัน — Seangdee" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already guards /account, but re-check here as defense in depth.
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single<Profile>();

  const isStaff = profile?.role === "admin" || profile?.role === "staff";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">บัญชีของฉัน</h1>
      <p className="mt-1 text-sm text-slate-500">ข้อมูลบัญชีของคุณ</p>

      {isStaff && (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-indigo-900">
              คุณเป็น{profile?.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
            </p>
            <p className="mt-0.5 text-sm text-indigo-700">
              เข้าสู่ระบบจัดการร้านเพื่อดูแลสต๊อก บิล และงานหลังบ้าน
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            เข้าสู่ระบบจัดการร้าน →
          </Link>
        </div>
      )}

      <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Row label="ชื่อ-นามสกุล" value={profile?.full_name || "—"} />
        <Row label="อีเมล" value={user.email || "—"} />
        {user.phone && (
          <Row label="เบอร์โทรศัพท์" value={formatPhoneTH(user.phone)} />
        )}
        <Row
          label="สมัครเมื่อ"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"
          }
        />
      </div>

      <div className="mt-6">
        <form action={customerLogout}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
