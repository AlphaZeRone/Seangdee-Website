// Date-range helpers for the summary page. All boundaries are computed in the
// shop's timezone (Asia/Bangkok, UTC+7, no DST) so "today" means the local day.

const TZ = "Asia/Bangkok";
const OFFSET = "+07:00";

export type Period = "day" | "month" | "year";

/** Extract Bangkok-local year/month/day parts from an ISO timestamp. */
export function bkkYmd(iso: string): { y: string; m: string; d: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { y: get("year"), m: get("month"), d: get("day") };
}

function todayParts() {
  return bkkYmd(new Date().toISOString());
}

/** Default reference string for a period ("YYYY-MM-DD" / "YYYY-MM" / "YYYY"). */
export function defaultRef(period: Period): string {
  const { y, m, d } = todayParts();
  if (period === "day") return `${y}-${m}-${d}`;
  if (period === "month") return `${y}-${m}`;
  return y;
}

export interface RangeInfo {
  startISO: string;
  endISO: string;
  label: string;
  prevRef: string;
  nextRef: string;
  /** How the breakdown table groups rows. */
  bucket: "bill" | "day" | "month";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function computeRange(period: Period, refInput?: string): RangeInfo {
  const ref = refInput && refInput.trim() ? refInput : defaultRef(period);

  if (period === "day") {
    const [y, m, d] = ref.split("-").map(Number);
    const start = new Date(`${ref}T00:00:00${OFFSET}`);
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    const prev = new Date(start.getTime() - 24 * 3600 * 1000);
    const next = end;
    const fmt = (dt: Date) => {
      const p = bkkYmd(dt.toISOString());
      return `${p.y}-${p.m}-${p.d}`;
    };
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      label: `${d} / ${m} / ${y}`,
      prevRef: fmt(prev),
      nextRef: fmt(next),
      bucket: "bill",
    };
  }

  if (period === "month") {
    const [y, m] = ref.split("-").map(Number);
    const start = new Date(`${y}-${pad(m)}-01T00:00:00${OFFSET}`);
    const endY = m === 12 ? y + 1 : y;
    const endM = m === 12 ? 1 : m + 1;
    const end = new Date(`${endY}-${pad(endM)}-01T00:00:00${OFFSET}`);
    const prevY = m === 1 ? y - 1 : y;
    const prevM = m === 1 ? 12 : m - 1;
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      label: `${pad(m)} / ${y}`,
      prevRef: `${prevY}-${pad(prevM)}`,
      nextRef: `${endY}-${pad(endM)}`,
      bucket: "day",
    };
  }

  // year
  const y = Number(ref);
  const start = new Date(`${y}-01-01T00:00:00${OFFSET}`);
  const end = new Date(`${y + 1}-01-01T00:00:00${OFFSET}`);
  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    label: `ปี ${y}`,
    prevRef: String(y - 1),
    nextRef: String(y + 1),
    bucket: "month",
  };
}
