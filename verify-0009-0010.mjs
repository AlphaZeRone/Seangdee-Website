// Read-only existence check for migrations 0009 (suppliers/barcode/SN) and
// 0010 (is_serialized/product_units/receive_units). Creates NO rows.
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
const svc = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const out = {};

// Relation/column probes: select with limit 0 returns no rows but errors if the
// relation or column is missing (42P01 relation / 42703 column / PGRST205 cache).
async function probe(label, table, cols) {
  const { error } = await svc.from(table).select(cols).limit(0);
  out[label] = error ? `MISSING ✗ (${error.code || ""} ${error.message})` : "ok ✓";
}

// 0009
await probe("suppliers_table", "suppliers", "id");
await probe("products.barcode/serial_number/supplier_id", "products", "barcode, serial_number, supplier_id");

// 0010
await probe("products.is_serialized", "products", "is_serialized");
await probe("product_units_table", "product_units", "id, serial_number, supplier_id, status");

// receive_units RPC: empty serials aborts BEFORE any insert (auth/no-serials
// guards run first), so this is a non-mutating existence probe.
const { error: rpcErr } = await svc.rpc("receive_units", {
  p_product_id: "00000000-0000-0000-0000-000000000000",
  p_serials: [],
  p_supplier_id: null,
  p_unit_cost: null,
  p_note: "",
});
out["receive_units_rpc"] =
  rpcErr && (rpcErr.code === "PGRST202" || /Could not find the function/i.test(rpcErr.message || ""))
    ? `MISSING ✗ (${rpcErr.message})`
    : `exists ✓ (guard: ${rpcErr ? rpcErr.message : "no error"})`;

console.log(JSON.stringify(out, null, 2));
