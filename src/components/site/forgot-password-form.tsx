"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-6 text-center">
        <p className="text-2xl">📧</p>
        <p className="mt-2 text-sm text-green-800">{state.success}</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          กลับไปหน้าเข้าสู่ระบบ →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังส่ง…" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        นึกรหัสผ่านออกแล้ว?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
