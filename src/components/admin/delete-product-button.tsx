"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const confirm = () => {
    setError(null);
    start(async () => {
      const res = await deleteProduct(productId);
      // On success the action redirects; only an error returns here.
      if (res?.error) setError(res.error);
    });
  };

  if (!open) {
    return (
      <Button variant="danger" type="button" onClick={() => setOpen(true)}>
        ลบสินค้า
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">
          ลบสินค้า &ldquo;{productName}&rdquo;?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          สินค้าและประวัติสต๊อกทั้งหมดจะถูกลบถาวร (ย้อนกลับไม่ได้)
          บิลที่ออกไปแล้วยังอยู่ครบและไม่เปลี่ยนแปลง
        </p>
        <p className="mt-2 text-sm text-slate-500">
          หากเพียงต้องการหยุดขายชั่วคราว ให้ใช้ &ldquo;ปิดการขาย&rdquo; แทน
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={confirm}
            disabled={pending}
          >
            {pending ? "กำลังลบ…" : "ลบถาวร"}
          </Button>
        </div>
      </div>
    </div>
  );
}
