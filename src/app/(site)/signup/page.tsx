import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { SignupForm } from "@/components/site/signup-form";

export const metadata = { title: "สมัครสมาชิก — Seangdee" };

export default async function SignupPage() {
  // Already signed in → no need to register again.
  if (await getCurrentUser()) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">สมัครสมาชิก</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        สร้างบัญชีเพื่อรับบริการจากแสงดี
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
