// Shop identity — the single source of truth for shop details across the site
// (bills/tax invoices, the Contact page, and the footer).
//
// TODO(owner): replace every value marked PLACEHOLDER below with the real one.
// Editing this file updates the whole site — no other file needs to change.

/**
 * The legal/HQ identity of the business. This is what goes on bills and tax
 * invoices, so it must stay a single set of values even though the shop has
 * more than one branch — see BRANCHES below for the storefronts.
 */
export const SHOP = {
  name_th: "ร้านแสงดี",
  name_en: "Seangdee CCTV & Internet",
  tagline_th: "ร้านจำหน่ายกล้องวงจรปิดและอุปกรณ์อินเทอร์เน็ต",

  /** Head-office address — the one printed on bills/tax invoices. */
  address: "224/1 หมู่ 8 แขวงท่าแร้ง เขตบางเขน กรุงเทพมหานคร 10230",
  /** Main contact number, used for the site-wide "call us" buttons. */
  phone: "086-789-9635",
  /** PLACEHOLDER — the shop's LINE Official Account id, including the "@". */
  line_id: "@seangdee",
  /** PLACEHOLDER — contact email. Set to null to hide the email row. */
  email: "contact@seangdee.com" as string | null,
  /** PLACEHOLDER — Facebook page URL. Set to null to hide it. */
  facebook_url: null as string | null,

  tax_id: "[เลขประจำตัวผู้เสียภาษีของร้าน]",
};

export interface OpeningHours {
  days: string;
  hours: string;
}

/** Default opening hours, used by any branch that doesn't override them.
 *  PLACEHOLDER — adjust to reality. */
export const DEFAULT_HOURS: OpeningHours[] = [
  { days: "จันทร์ – ศุกร์", hours: "09:00 – 18:00 น." },
  { days: "เสาร์", hours: "09:00 – 17:00 น." },
  { days: "อาทิตย์", hours: "ปิดทำการ" },
];

export interface Branch {
  /** URL-safe id, also used as the React key. */
  id: string;
  name_th: string;
  /** Short label for the branch switcher, e.g. "บางเขน". */
  short_th: string;
  address: string;
  phone: string;
  hours: OpeningHours[];
  /** Google Maps `output=embed` URL for the <iframe>. */
  map_embed_url: string;
  /** Full Google Maps link, for the "open in Maps" / directions button. */
  map_link_url: string;
  /** Optional extra line — landmark, parking, "closed for renovation", etc. */
  note?: string;
}

/**
 * The physical storefronts. Order matters: the first one is treated as the
 * main branch and is shown expanded first on /contact.
 */
export const BRANCHES: Branch[] = [
  {
    id: "bangkhen",
    name_th: "แสงดี · สาขาบางเขน (กรุงเทพฯ)",
    short_th: "บางเขน",
    address: SHOP.address,
    phone: SHOP.phone,
    hours: DEFAULT_HOURS,
    // Exact storefront pin: 13.849622391186964, 100.64302826760434
    // (ซอยรามอินทรา 57 แยก 1, แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ — from the owner).
    map_embed_url:
      "https://www.google.com/maps?q=13.849622391186964,100.64302826760434&output=embed",
    map_link_url:
      "https://www.google.com/maps/search/?api=1&query=13.849622391186964,100.64302826760434",
  },
  {
    id: "nonthaburi",
    name_th: "แสงดี อิเลคทรอนิคส์ · สาขานนทบุรี",
    short_th: "นนทบุรี",
    // TODO(owner): PLACEHOLDER — the exact street address for this branch was
    // never given; only the map pin. The map below IS correct (exact
    // coordinates from the shop's own Google Maps listing).
    address: "[ที่อยู่สาขานนทบุรี — รอข้อมูลจากทางร้าน]",
    // TODO(owner): PLACEHOLDER — does this branch have its own phone number?
    // Currently falls back to the main number.
    phone: SHOP.phone,
    hours: DEFAULT_HOURS,
    // Exact storefront pin: 13.923659304028536, 100.47290981192833
    // (ถ.ชัยพฤกษ์ ต.คลองพระอุดม อ.ปากเกร็ด นนทบุรี — from the owner).
    map_embed_url:
      "https://www.google.com/maps?q=13.923659304028536,100.47290981192833&output=embed",
    map_link_url:
      "https://www.google.com/maps/search/?api=1&query=13.923659304028536,100.47290981192833",
  },
];

/** `tel:` href built from any display phone number. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;

/** `tel:` href for the main shop number. */
export const TEL_HREF = telHref(SHOP.phone);

/** Deep link that opens the shop's LINE OA chat. */
export const LINE_URL = `https://line.me/R/ti/p/${encodeURIComponent(SHOP.line_id)}`;
