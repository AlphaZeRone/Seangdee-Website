// Shop identity — the single source of truth for shop details across the site
// (bills/tax invoices, the About page, the Contact page, and the footer).
//
// TODO(owner): replace every value marked PLACEHOLDER below with the real one.
// Editing this file updates the whole site — no other file needs to change.

export const SHOP = {
  name_th: "ร้านแสงดี",
  name_en: "Seangdee CCTV & Internet",
  tagline_th: "ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ต",

  address: "224/1 หมู่ 8 แขวงท่าแร้ง เขตบางเขน กรุงเทพมหานคร 10230",
  phone: "086-789-9635",
  /** PLACEHOLDER — second line / shop landline. Set to null to hide it. */
  phone_alt: null as string | null,
  /** PLACEHOLDER — the shop's LINE Official Account id, including the "@". */
  line_id: "@seangdee",
  /** PLACEHOLDER — contact email. Set to null to hide the email row. */
  email: "contact@seangdee.com" as string | null,
  /** PLACEHOLDER — Facebook page URL. Set to null to hide it. */
  facebook_url: null as string | null,

  tax_id: "[เลขประจำตัวผู้เสียภาษีของร้าน]",

  /** PLACEHOLDER — the year the shop opened, used in the About copy. */
  established_year: 2558,
};

/** Opening hours, shown on the Contact page. PLACEHOLDER — adjust to reality. */
export const OPENING_HOURS: { days: string; hours: string }[] = [
  { days: "จันทร์ – ศุกร์", hours: "09:00 – 18:00 น." },
  { days: "เสาร์", hours: "09:00 – 17:00 น." },
  { days: "อาทิตย์", hours: "ปิดทำการ" },
];

/**
 * Google Maps embed URL for the shop location.
 *
 * TODO(owner): to get the real one — open Google Maps, find the shop, click
 * Share → Embed a map → Copy HTML, then paste ONLY the src="..." value here.
 * Until then this falls back to a search-by-address embed, which lands on the
 * right neighbourhood but not the exact storefront pin.
 */
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  SHOP.address
)}&output=embed`;

/** Same location, opened in the full Google Maps app/site (for directions). */
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  SHOP.address
)}`;

/** `tel:` href built from the display phone number. */
export const TEL_HREF = `tel:${SHOP.phone.replace(/[^0-9+]/g, "")}`;

/** Deep link that opens the shop's LINE OA chat. */
export const LINE_URL = `https://line.me/R/ti/p/${encodeURIComponent(SHOP.line_id)}`;
