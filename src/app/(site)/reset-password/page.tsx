import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { ResetPasswordForm } from "@/components/site/reset-password-form";

export const metadata = { title: "ตั้งรหัสผ่านใหม่ — Seangdee" };

export default async function ResetPasswordPage() {
  // The reset email link routes through /auth/callback, which establishes a
  // recovery session before forwarding here. No session → the link is missing,
  // expired, or invalid; ask the user to request a fresh one.
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        ตั้งรหัสผ่านใหม่
      </h1>

      {user ? (
        <>
          <p className="mt-1 text-center text-sm text-slate-500">
            กรอกรหัสผ่านใหม่ที่คุณต้องการใช้
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ResetPasswordForm />
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-2xl">⚠️</p>
          <p className="mt-2 text-sm text-slate-600">
            ลิงก์ตั้งรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่อีกครั้ง
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            ขอลิงก์รีเซ็ตรหัสผ่านใหม่ →
          </Link>
        </div>
      )}
    </div>
  );
}
