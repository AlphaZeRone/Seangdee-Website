import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Thai Baht currency. */
export function formatBaht(value: number | null | undefined): string {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Normalize a Thai phone number to E.164 (+66…), which is what Supabase Auth
 * requires. Accepts common local formats: "081-234-5678", "0812345678",
 * "+66812345678", "66812345678". Returns null if it can't be parsed.
 */
export function toE164TH(input: string): string | null {
  const cleaned = input.trim().replace(/[\s()-]/g, "");
  if (/^\+66\d{9}$/.test(cleaned)) return cleaned; // already E.164
  if (/^66\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0\d{9}$/.test(cleaned)) return `+66${cleaned.slice(1)}`; // 0XXXXXXXXX
  return null;
}

/** Show a stored E.164 Thai number back in friendly local form (0XX-XXX-XXXX). */
export function formatPhoneTH(e164: string | null | undefined): string {
  if (!e164) return "—";
  // Supabase stores the number without the leading "+" (e.g. "66812345678").
  const m = /^\+?66(\d{9})$/.exec(e164);
  if (!m) return e164;
  const n = `0${m[1]}`;
  return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
}

/** Format an ISO timestamp for display (Thai locale). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
