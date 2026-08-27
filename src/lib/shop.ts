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
  /** The shop's LINE id (search by this id to add). */
  line_id: "0895008008",
  /** Contact email. null hides the email row everywhere. */
  email: null as string | null,
  /** Facebook page URL. Set to null to hide it. */
  facebook_url: null as string | null,

  /** Seller tax id. null hides the "เลขผู้เสียภาษี" line on invoices. */
  tax_id: null as string | null,
};

export interface OpeningHours {
  days: string;
  hours: string;
}

/** Default opening hours — matches the Bang Khen (main) branch. */
export const DEFAULT_HOURS: OpeningHours[] = [
  { days: "จันทร์ – เสาร์", hours: "08:00 – 17:30 น." },
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
    address:
      "80/6 หมู่ 5 ถนนชัยพฤกษ์ ตำบลคลองพระอุดม อำเภอปากเกร็ด นนทบุรี 11120",
    phone: "095-624-1491",
    hours: [
      { days: "จันทร์ – เสาร์", hours: "09:00 – 17:00 น." },
      { days: "อาทิตย์", hours: "ปิดทำการ" },
    ],
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
