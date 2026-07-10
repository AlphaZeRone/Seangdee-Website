"use client";

import { useActionState } from "react";
import Link from "next/link";
import { customerLogin } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { GoogleButton } from "@/components/site/google-button";

export function CustomerLoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(customerLogin, undefined);

  return (
    <div className="space-y-4">
      <GoogleButton next={next ?? "/account"} />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        หรือ
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/account"} />

        <div>
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <FieldError messages={state?.fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <FieldError messages={state?.fieldErrors?.password} />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        ยังไม่มีบัญชี?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
