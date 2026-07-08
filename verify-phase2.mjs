// Phase 2 live-DB verification: average cost, VAT billing, stock decrement.
// Run AFTER applying migrations 0002-0004. Cleans up all test rows.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const out = {};
let brandId, productId, userId, billId;
const round2 = (n) => Math.round(n * 100) / 100;

try {
  // --- Average cost -------------------------------------------------------
  const { data: brand } = await svc
    .from("brands")
    .insert({ name: "ZZ-TEST-BRAND" })
    .select("id")
    .single();
  brandId = brand.id;

  const { data: prod } = await svc
    .from("products")
    .insert({
      sku: "ZZ-P2-VERIFY",
      name_th: "สินค้าทดสอบ P2",
      name_en: "P2 Verify",
      brand_id: brandId,
      cost_price: 100,
      sale_price: 200, // VAT-inclusive
      quantity: 0,
      status: "active",
    })
    .select("id")
    .single();
  productId = prod.id;

  await svc.from("stock_movements").insert({
    product_id: productId,
    change_qty: 10,
    reason: "purchase",
    unit_cost: 100,
  });
  await svc.from("stock_movements").insert({
    product_id: productId,
    change_qty: 10,
    reason: "purchase",
    unit_cost: 130,
  });

  const { data: afterCost } = await svc
    .from("products")
    .select("quantity, cost_price")
    .eq("id", productId)
    .single();
  out.avg_cost = `${afterCost.cost_price} (expect 115)`;
  out.qty_after_restock = `${afterCost.quantity} (expect 20)`;

  // --- Billing via RPC as a real staff user -------------------------------
  const email = `p2verify_${Date.now()}@example.com`;
  const password = "Test-12345!";
  const { data: created } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  userId = created.user.id;
  await svc.from("profiles").update({ role: "admin" }).eq("id", userId);

  const userClient = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email,
    password,
  });
  out.staff_signin = signInErr ? `ERROR: ${signInErr.message}` : "ok";

  const { data: newBillId, error: billErr } = await userClient.rpc(
    "create_bill",
    {
      p_items: [{ product_id: productId, quantity: 5 }],
      p_is_tax_invoice: true,
      p_customer_name: "ลูกค้าทดสอบ",
      p_customer_phone: "0800000000",
      p_customer_address: "123 ทดสอบ",
      p_customer_tax_id: "0000000000000",
      p_note: "verify",
    }
  );
  out.create_bill = billErr ? `ERROR: ${billErr.message}` : "ok";
  billId = newBillId;

  if (billId) {
    const { data: bill } = await svc
      .from("bills")
      .select("subtotal, vat_amount, total")
      .eq("id", billId)
      .single();
    const total = Number(bill.total);
    const expSub = round2(total / 1.07);
    const expVat = round2(total - expSub);
    out.bill_total = `${total} (expect 1000 = 5 x 200)`;
    out.vat_breakdown_ok =
      Number(bill.subtotal) === expSub && Number(bill.vat_amount) === expVat
        ? `ok (base ${bill.subtotal} + vat ${bill.vat_amount})`
        : `MISMATCH sub=${bill.subtotal} vat=${bill.vat_amount} exp ${expSub}/${expVat}`;

    const { data: afterSale } = await svc
      .from("products")
      .select("quantity")
      .eq("id", productId)
      .single();
    out.qty_after_sale = `${afterSale.quantity} (expect 15)`;

    const { data: bi } = await svc
      .from("bill_items")
      .select("unit_cost_at_sale, quantity")
      .eq("bill_id", billId);
    out.cogs_snapshot = `unit_cost_at_sale=${bi?.[0]?.unit_cost_at_sale} (expect 115)`;
  }

  // Insufficient-stock guard: try to sell 9999.
  const { error: overErr } = await userClient.rpc("create_bill", {
    p_items: [{ product_id: productId, quantity: 9999 }],
    p_is_tax_invoice: false,
    p_customer_name: "",
    p_customer_phone: "",
    p_customer_address: "",
    p_customer_tax_id: "",
    p_note: "",
  });
  out.oversell_blocked = overErr ? "blocked ✓" : "NOT BLOCKED ✗";
} catch (e) {
  out.fatal = String(e);
} finally {
  // Cleanup
  if (billId) await svc.from("bills").delete().eq("id", billId);
  if (productId) await svc.from("products").delete().eq("id", productId);
  if (brandId) await svc.from("brands").delete().eq("id", brandId);
  if (userId) await svc.auth.admin.deleteUser(userId);
  out.cleanup = "done";
}

console.log(JSON.stringify(out, null, 2));
