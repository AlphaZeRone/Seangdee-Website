"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { voidBill } from "@/lib/actions/bills";
import { Button } from "@/components/ui";

export function VoidBillButton({ billId }: { billId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await voidBill(billId, reason.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        ยกเลิกบิล
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">ยกเลิกบิลนี้?</h2>
        <p className="mt-2 text-sm text-slate-600">
          สต๊อกสินค้าในบิลจะถูกคืนกลับเข้าคลัง และบิลจะถูกทำเครื่องหมายว่า
          &ldquo;ยกเลิก&rdquo; (ไม่นับรวมในสรุปยอดขาย) — ไม่สามารถย้อนกลับได้
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          เหตุผล (ไม่บังคับ)
        </label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="เช่น ออกบิลผิด, ลูกค้าคืนสินค้า"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

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
            ไม่ยกเลิก
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={confirm}
            disabled={pending}
          >
            {pending ? "กำลังยกเลิก…" : "ยืนยันยกเลิกบิล"}
          </Button>
        </div>
      </div>
    </div>
  );
}
