"use client";

import { useActionState } from "react";
import { addStockMovement } from "@/lib/actions/products";
import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
} from "@/components/ui";

export function AddStockForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    addStockMovement,
    undefined
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="change_qty">จำนวน (+ รับเข้า / − ตัดออก)</Label>
          <Input
            id="change_qty"
            name="change_qty"
            type="number"
            step="1"
            placeholder="เช่น 10 หรือ -2"
            required
          />
          <FieldError messages={state?.fieldErrors?.change_qty} />
        </div>
        <div>
          <Label htmlFor="reason">ประเภท</Label>
          <Select id="reason" name="reason" defaultValue="purchase">
            <option value="purchase">รับเข้า (ซื้อ)</option>
            <option value="sale">ขายออก</option>
            <option value="adjustment">ปรับปรุงยอด</option>
            <option value="return">รับคืน</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="unit_cost">ต้นทุนต่อหน่วย (บาท)</Label>
        <Input
          id="unit_cost"
          name="unit_cost"
          type="number"
          step="0.01"
          min="0"
          placeholder="กรอกเมื่อรับเข้า (purchase) — ใช้คำนวณต้นทุนเฉลี่ย"
        />
        <FieldError messages={state?.fieldErrors?.unit_cost} />
      </div>

      <div>
        <Label htmlFor="note">หมายเหตุ</Label>
        <Input id="note" name="note" placeholder="(ไม่บังคับ)" />
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
        {pending ? "กำลังบันทึก…" : "บันทึกสต๊อก"}
      </Button>
    </form>
  );
}
