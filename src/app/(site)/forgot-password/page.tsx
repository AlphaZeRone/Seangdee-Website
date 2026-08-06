import { ForgotPasswordForm } from "@/components/site/forgot-password-form";

export const metadata = { title: "ลืมรหัสผ่าน — Seangdee" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        ลืมรหัสผ่าน
      </h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        กรอกอีเมลที่ใช้สมัคร แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
