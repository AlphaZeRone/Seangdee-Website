"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { phoneSignup, verifyPhoneOtp } from "@/lib/actions/customer-auth";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { formatPhoneTH } from "@/lib/utils";

export function PhoneSignupForm() {
  const [signupState, signupAction, signupPending] = useActionState(
    phoneSignup,
    undefined
  );
  const [otpState, otpAction, otpPending] = useActionState(
    verifyPhoneOtp,
    undefined
  );
  // Set once step 1 succeeds — the action returns the normalized E.164 number
  // as `success`, which also switches us to the code-entry step.
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    if (signupState?.success) setPhone(signupState.success);
  }, [signupState]);

  // Step 2 — enter the SMS code.
  if (phone) {
    return (
      <form action={otpAction} className="space-y-4">
        <input type="hidden" name="phone" value={phone} />
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          เราส่งรหัส 6 หลักไปที่ <strong>{formatPhoneTH(phone)}</strong> แล้ว
          กรุณากรอกเพื่อยืนยันการสมัคร
        </p>
        <div>
          <Label htmlFor="token">รหัสยืนยัน (OTP)</Label>
          <Input
            id="token"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            required
          />
          <FieldError messages={otpState?.fieldErrors?.token} />
        </div>

        {otpState?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {otpState.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={otpPending}>
          {otpPending ? "กำลังยืนยัน…" : "ยืนยันและสมัครสมาชิก"}
        </Button>

        <button
          type="button"
          onClick={() => setPhone(null)}
          className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          ← แก้ไขเบอร์โทรศัพท์
        </button>
      </form>
    );
  }

  // Step 1 — phone + password.
  return (
    <form action={signupAction} className="space-y-4">
      <div>
        <Label htmlFor="p_full_name">ชื่อ-นามสกุล</Label>
        <Input
          id="p_full_name"
          name="full_name"
          autoComplete="name"
          placeholder="ชื่อของคุณ"
          required
        />
        <FieldError messages={signupState?.fieldErrors?.full_name} />
      </div>

      <div>
        <Label htmlFor="p_phone">เบอร์โทรศัพท์</Label>
        <Input
          id="p_phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="081-234-5678"
          required
        />
        <FieldError messages={signupState?.fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="p_password">รหัสผ่าน</Label>
        <Input
          id="p_password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          required
        />
        <FieldError messages={signupState?.fieldErrors?.password} />
      </div>

      {signupState?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {signupState.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={signupPending}>
        {signupPending ? "กำลังสมัคร…" : "สมัครสมาชิก"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
