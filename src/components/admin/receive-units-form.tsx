"use client";

import { useActionState, useState } from "react";
import { receiveUnits } from "@/lib/actions/units";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import type { Supplier } from "@/lib/types";

export function ReceiveUnitsForm({
  productId,
  suppliers,
}: {
  productId: string;
  suppliers: Supplier[];
}) {
  const [state, formAction, pending] = useActionState(receiveUnits, undefined);
  const [serials, setSerials] = useState("");

  const count = serials
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />

      <div>
        <Label htmlFor="serials">
          Serial Numbers — 1 หมายเลขต่อบรรทัด (สแกนหรือวางได้)
        </Label>
        <Textarea
          id="serials"
          name="serials"
          rows={5}
          value={serials}
          onChange={(e) => setSerials(e.target.value)}
          placeholder={"SN000001\nSN000002\nSN000003"}
        />
        <p className="mt-1 text-xs text-slate-400">
          จำนวนที่จะรับเข้า: <span className="font-medium">{count}</span> หน่วย
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="supplier_id">ผู้จำหน่าย (ที่สั่งซื้อล็อตนี้)</Label>
          <Select id="supplier_id" name="supplier_id" defaultValue="">
            <option value="">— ไม่ระบุ —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="unit_cost">ต้นทุนต่อหน่วย (บาท)</Label>
          <Input
            id="unit_cost"
            name="unit_cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="ใช้คำนวณต้นทุนเฉลี่ย (ไม่บังคับ)"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="note">หมายเหตุ</Label>
        <Input id="note" name="note" placeholder="(ไม่บังคับ) เช่น เลขที่ใบสั่งซื้อ" />
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

      <Button type="submit" disabled={pending || count === 0}>
        {pending ? "กำลังรับเข้า…" : `รับเข้า ${count} หน่วย`}
      </Button>
    </form>
  );
}
