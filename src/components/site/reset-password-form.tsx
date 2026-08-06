"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="password">รหัสผ่านใหม่</Label>
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

      <div>
        <Label htmlFor="confirm">ยืนยันรหัสผ่านใหม่</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={state?.fieldErrors?.confirm} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
      </Button>
    </form>
  );
}
