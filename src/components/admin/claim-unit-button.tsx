"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUnitStatus } from "@/lib/actions/units";

export function ClaimUnitButton({ unitId }: { unitId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const claim = () => {
    const note = window.prompt(
      "บันทึกการเคลม — รายละเอียด/เลขที่ RMA (ไม่บังคับ):",
      ""
    );
    if (note === null) return; // cancelled
    setErr(null);
    start(async () => {
      const res = await setUnitStatus(unitId, "claimed", note);
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
        onClick={claim}
        disabled={pending}
        className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก…" : "บันทึกเคลม"}
      </button>
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </>
  );
}
