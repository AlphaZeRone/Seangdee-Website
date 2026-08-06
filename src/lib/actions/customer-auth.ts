"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  customerLoginSchema,
  customerSignupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  phoneSignupSchema,
  phoneOtpSchema,
  phoneLoginSchema,
} from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";
import { toE164TH } from "@/lib/utils";

/** Only allow same-site relative paths, and never send a customer into /admin. */
function safeNext(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin")
    ? raw
    : "/account";
}

/** Customer self-registration (email + password). The DB trigger gives new
 *  users the 'customer' role automatically (migration 0011). */
export async function customerSignup(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = customerSignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    return {
      error:
        "สมัครสมาชิกไม่สำเร็จ — อีเมลนี้อาจถูกใช้แล้ว หรือรหัสผ่านไม่ปลอดภัยพอ",
    };
  }

  // When email confirmation is enabled in Supabase, there is no session yet —
  // the user must click the link in their inbox first.
  if (!data.session) {
    return {
      success:
        "สมัครสมาชิกสำเร็จ! เราได้ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว กรุณายืนยันแล้วเข้าสู่ระบบ",
    };
  }

  redirect("/account");
}

/** Customer login (email + password). */
export async function customerLogin(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function customerLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Phone signup step 1: create the account and trigger an SMS OTP. On success
 *  the client advances to the code-entry step. The DB trigger assigns the
 *  'customer' role and stores full_name from user metadata (migration 0011). */
export async function phoneSignup(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = phoneSignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const phone = toE164TH(parsed.data.phone);
  if (!phone) {
    return { fieldErrors: { phone: ["เบอร์โทรศัพท์ไม่ถูกต้อง"] } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    phone,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name } },
  });

  if (error) {
    return {
      error:
        "สมัครไม่สำเร็จ — เบอร์นี้อาจถูกใช้แล้ว หรือระบบส่ง SMS ยังไม่พร้อมใช้งาน",
    };
  }

  // Success — Supabase sent a 6-digit code by SMS. Echo the normalized phone
  // back so the verify step knows which number to confirm.
  return { success: phone };
}

/** Phone signup step 2: verify the SMS code, which logs the user in. */
export async function verifyPhoneOtp(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = phoneOtpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const phone = toE164TH(parsed.data.phone);
  if (!phone) {
    return { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: parsed.data.token,
    type: "sms",
  });

  if (error) {
    return { error: "รหัสไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/account");
}

/** Customer login by phone number + password. */
export async function phoneLogin(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = phoneLoginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const phone = toE164TH(parsed.data.phone);
  if (!phone) {
    return { fieldErrors: { phone: ["เบอร์โทรศัพท์ไม่ถูกต้อง"] } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    phone,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect(safeNext(String(formData.get("next") ?? "")));
}

/** Step 1 of reset: email the user a password-reset link. The link lands on
 *  /auth/callback (which establishes a recovery session) and forwards to
 *  /reset-password. We ALWAYS report success so we never reveal whether an
 *  email is registered. */
export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return {
    success:
      "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ",
  };
}

/** Step 2 of reset: set the new password. Requires the recovery session set by
 *  the callback after the user clicked the email link. */
export async function updatePassword(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่อีกครั้ง",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: `ตั้งรหัสผ่านใหม่ไม่สำเร็จ: ${error.message}` };
  }

  redirect("/account");
}
