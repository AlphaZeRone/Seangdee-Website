import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { CustomerLoginForm } from "@/components/site/login-form";

export const metadata = { title: "เข้าสู่ระบบ — Seangdee" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin")
      ? next
      : "/account";

  // Already signed in → skip the form.
  if (await getCurrentUser()) redirect(safeNext);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-slate-900">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        ยินดีต้อนรับกลับมา
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CustomerLoginForm next={safeNext} />
      </div>
    </div>
  );
}
