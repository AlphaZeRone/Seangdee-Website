"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStockMovement } from "@/lib/actions/products";

export function DeleteMovementButton({
  movementId,
  productId,
}: {
  movementId: string;
  productId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onClick = () => {
    if (
      !window.confirm(
        "ลบรายการนี้? จำนวนคงเหลือและต้นทุนเฉลี่ยจะถูกคำนวณใหม่ (ย้อนกลับไม่ได้)"
      )
    )
      return;
    setErr(null);
    start(async () => {
      const res = await deleteStockMovement(movementId, productId);
      if (res.error) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "กำลังลบ…" : "ลบ"}
      </button>
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </>
  );
}
