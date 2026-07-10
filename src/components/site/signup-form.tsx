"use client";

import { useActionState } from "react";
import Link from "next/link";
import { customerSignup } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { GoogleButton } from "@/components/site/google-button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(customerSignup, undefined);

  // On success (email confirmation required) show a confirmation panel instead.
  if (state?.success) {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-6 text-center">
        <p className="text-sm text-green-800">{state.success}</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          ไปหน้าเข้าสู่ระบบ →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GoogleButton next="/account" />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        หรือ
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            placeholder="ชื่อของคุณ"
            required
          />
          <FieldError messages={state?.fieldErrors?.full_name} />
        </div>

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
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
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
          {pending ? "กำลังสมัคร…" : "สมัครสมาชิก"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
