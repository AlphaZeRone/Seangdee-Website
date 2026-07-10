"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { customerLoginSchema, customerSignupSchema } from "@/lib/validators";
import { toFieldErrors, type FormState } from "@/lib/form";

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
