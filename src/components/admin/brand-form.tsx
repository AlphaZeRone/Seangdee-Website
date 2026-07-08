"use client";

import { useActionState } from "react";
import { createBrand } from "@/lib/actions/brands";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function BrandForm() {
  const [state, formAction, pending] = useActionState(createBrand, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="name">ชื่อแบรนด์ *</Label>
        <Input id="name" name="name" placeholder="เช่น Hikvision, Dahua, TP-Link" required />
        <FieldError messages={state?.fieldErrors?.name} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "เพิ่มแบรนด์"}
      </Button>
    </form>
  );
}
