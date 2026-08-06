"use client";

import { useActionState } from "react";
import { phoneLogin } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function PhoneLoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(phoneLogin, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/account"} />

      <div>
        <Label htmlFor="login_phone">เบอร์โทรศัพท์</Label>
        <Input
          id="login_phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="081-234-5678"
          required
        />
        <FieldError messages={state?.fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="login_phone_password">รหัสผ่าน</Label>
        <Input
          id="login_phone_password"
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
  );
}
