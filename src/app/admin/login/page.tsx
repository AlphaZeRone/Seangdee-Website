import { LoginForm } from "./login-form";

export const metadata = { title: "เข้าสู่ระบบ — Seangdee Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">แสงดี · Seangdee</h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการสต๊อก · Admin
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
