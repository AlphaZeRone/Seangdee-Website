"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Generates a single-page PDF from the receipt DOM and downloads it.
 *  html2canvas-pro + jspdf are imported dynamically so they stay out of the SSR
 *  bundle. html2canvas-pro (not classic) is required because Tailwind v4 emits
 *  oklch() colors, which the classic library cannot parse. The receipt is
 *  captured as-rendered, so the Noto Sans Thai text comes out correct. */
export function DownloadPdfButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageW - margin * 2;
      // Preserve aspect ratio; clamp height to the page.
      let w = usableW;
      let h = (canvas.height / canvas.width) * w;
      if (h > pageH - margin * 2) {
        h = pageH - margin * 2;
        w = (canvas.width / canvas.height) * h;
      }
      const x = (pageW - w) / 2;
      pdf.addImage(img, "JPEG", x, margin, w, h);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={download} disabled={busy}>
      {busy ? "กำลังสร้าง PDF…" : "ดาวน์โหลด PDF"}
    </Button>
  );
}
