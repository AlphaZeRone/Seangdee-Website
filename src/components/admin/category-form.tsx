"use client";

import { useActionState } from "react";
import { createCategory } from "@/lib/actions/categories";
import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
} from "@/components/ui";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategory,
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="name_th">ชื่อหมวดหมู่ (ไทย) *</Label>
        <Input id="name_th" name="name_th" required />
        <FieldError messages={state?.fieldErrors?.name_th} />
      </div>
      <div>
        <Label htmlFor="name_en">Category name (EN) *</Label>
        <Input id="name_en" name="name_en" required />
        <FieldError messages={state?.fieldErrors?.name_en} />
      </div>
      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" name="slug" placeholder="เช่น cctv-camera" required />
        <FieldError messages={state?.fieldErrors?.slug} />
      </div>
      <div>
        <Label htmlFor="type">ประเภท</Label>
        <Select id="type" name="type" defaultValue="cctv">
          <option value="cctv">กล้องวงจรปิด (CCTV)</option>
          <option value="internet">อินเทอร์เน็ต (Internet)</option>
          <option value="accessory">อุปกรณ์เสริม (Accessory)</option>
        </Select>
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
        {pending ? "กำลังบันทึก…" : "เพิ่มหมวดหมู่"}
      </Button>
    </form>
  );
}
