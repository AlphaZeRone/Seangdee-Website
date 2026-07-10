"use client";

import { useActionState, useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { createBill, updateBill } from "@/lib/actions/bills";
import { formatBaht } from "@/lib/utils";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { Product } from "@/lib/types";

type SellProduct = Pick<
  Product,
  "id" | "name_th" | "sku" | "barcode" | "sale_price" | "quantity" | "unit"
>;

interface Line {
  product_id: string;
  quantity: number;
}

export interface BillFormInitial {
  billId: string;
  isTax: boolean;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_tax_id: string;
  note: string;
  lines: Line[];
}

export function BillForm({
  products,
  initial,
}: {
  products: SellProduct[];
  initial?: BillFormInitial;
}) {
  const editing = Boolean(initial);
  const [state, formAction, pending] = useActionState(
    editing ? updateBill : createBill,
    undefined
  );
  const [lines, setLines] = useState<Line[]>(initial?.lines ?? []);
  const [selProduct, setSelProduct] = useState("");
  const [selQty, setSelQty] = useState(1);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isTax, setIsTax] = useState(initial?.isTax ?? false);

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  // Filter the product list by Thai name, SKU or barcode as the user types.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list =
      q === ""
        ? products
        : products.filter(
            (p) =>
              p.name_th.toLowerCase().includes(q) ||
              (p.sku ?? "").toLowerCase().includes(q) ||
              (p.barcode ?? "").toLowerCase().includes(q)
          );
    return list.slice(0, 8);
  }, [query, products]);

  const pickProduct = (p: SellProduct) => {
    if (p.quantity <= 0) return;
    setSelProduct(p.id);
    setQuery(`${p.name_th}${p.sku ? ` (${p.sku})` : ""}`);
    setOpen(false);
  };

  // Add a product to the bill (merging quantity if it's already a line).
  const addProduct = (p: SellProduct, qty: number) => {
    if (p.quantity <= 0 || qty < 1) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === p.id);
      if (existing) {
        return prev.map((l) =>
          l.product_id === p.id ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [...prev, { product_id: p.id, quantity: qty }];
    });
    setSelProduct("");
    setSelQty(1);
    setQuery("");
  };

  const addLine = () => {
    const p = byId.get(selProduct);
    if (p) addProduct(p, selQty);
  };

  // Barcode scanners type the code then send Enter. Intercept Enter so it never
  // submits the form: on an exact barcode/SKU match (or a single filtered
  // result) add the product straight to the bill, ready for the next scan.
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (q === "") return;
    const exact = products.find(
      (p) =>
        (p.barcode ?? "").toLowerCase() === q ||
        (p.sku ?? "").toLowerCase() === q
    );
    const target = exact ?? (matches.length === 1 ? matches[0] : null);
    if (target) {
      addProduct(target, selQty);
      setOpen(false);
    }
  };

  const setQty = (pid: string, q: number) =>
    setLines((prev) =>
      prev.map((l) =>
        l.product_id === pid ? { ...l, quantity: Math.max(1, q) } : l
      )
    );
  const removeLine = (pid: string) =>
    setLines((prev) => prev.filter((l) => l.product_id !== pid));

  const total = lines.reduce(
    (s, l) => s + (byId.get(l.product_id)?.sale_price ?? 0) * l.quantity,
    0
  );
  const base = total / 1.07;
  const vat = total - base;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(lines)} />
      {editing && <input type="hidden" name="bill_id" value={initial!.billId} />}

      {/* Add line */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="relative min-w-[220px] grow">
          <Label htmlFor="pick">สินค้า</Label>
          <Input
            id="pick"
            autoComplete="off"
            placeholder="พิมพ์ชื่อสินค้า SKU หรือยิงบาร์โค้ด…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelProduct("");
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onSearchKeyDown}
          />
          {open && matches.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {matches.map((p) => {
                const out = p.quantity <= 0;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={out}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickProduct(p)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                        out
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-800 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {p.name_th}
                        </span>
                        {(p.sku || p.barcode) && (
                          <span className="block truncate text-xs text-slate-400">
                            {[p.sku, p.barcode].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block">{formatBaht(p.sale_price)}</span>
                        <span
                          className={`block text-xs ${
                            out ? "text-red-400" : "text-slate-400"
                          }`}
                        >
                          {out ? "หมด" : `คงเหลือ ${p.quantity}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {open && query.trim() !== "" && matches.length === 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 shadow-lg">
              ไม่พบสินค้า
            </div>
          )}
        </div>
        <div className="w-24">
          <Label htmlFor="pickqty">จำนวน</Label>
          <Input
            id="pickqty"
            type="number"
            min={1}
            value={selQty}
            onChange={(e) => setSelQty(Number(e.target.value))}
          />
        </div>
        <Button type="button" variant="secondary" onClick={addLine}>
          + เพิ่มรายการ
        </Button>
      </div>

      {/* Lines */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
              <th className="px-4 py-3 text-center">จำนวน</th>
              <th className="px-4 py-3 text-right">รวม</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  ยังไม่มีรายการ — เลือกสินค้าด้านบนแล้วกด “เพิ่มรายการ”
                </td>
              </tr>
            )}
            {lines.map((l) => {
              const p = byId.get(l.product_id);
              if (!p) return null;
              const overStock = l.quantity > p.quantity;
              return (
                <tr key={l.product_id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{p.name_th}</p>
                    <p className="text-xs text-slate-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatBaht(p.sale_price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) => setQty(l.product_id, Number(e.target.value))}
                      className={`w-20 rounded-lg border px-2 py-1 text-center text-sm ${
                        overStock ? "border-red-400 text-red-600" : "border-slate-300"
                      }`}
                    />
                    {overStock && (
                      <p className="mt-1 text-xs text-red-500">
                        เกินสต๊อก ({p.quantity})
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatBaht(p.sale_price * l.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(l.product_id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="ml-auto max-w-xs space-y-1 text-sm">
        <TotalRow label="ฐานภาษี (ก่อน VAT)" value={formatBaht(base)} />
        <TotalRow label="VAT 7%" value={formatBaht(vat)} />
        <TotalRow label="ยอดรวมทั้งสิ้น" value={formatBaht(total)} bold />
      </div>

      {/* Customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="customer_name">ชื่อลูกค้า</Label>
          <Input
            id="customer_name"
            name="customer_name"
            defaultValue={initial?.customer_name ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">เบอร์โทร</Label>
          <Input
            id="customer_phone"
            name="customer_phone"
            defaultValue={initial?.customer_phone ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="is_tax_invoice"
          checked={isTax}
          onChange={(e) => setIsTax(e.target.checked)}
          className="h-4 w-4"
        />
        ออกใบกำกับภาษี (กรอกที่อยู่และเลขผู้เสียภาษี)
      </label>

      {isTax && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="customer_address">ที่อยู่ลูกค้า</Label>
            <Textarea
              id="customer_address"
              name="customer_address"
              rows={2}
              defaultValue={initial?.customer_address ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="customer_tax_id">เลขประจำตัวผู้เสียภาษี</Label>
            <Input
              id="customer_tax_id"
              name="customer_tax_id"
              defaultValue={initial?.customer_tax_id ?? ""}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="note">หมายเหตุ</Label>
        <Input
          id="note"
          name="note"
          placeholder="(ไม่บังคับ)"
          defaultValue={initial?.note ?? ""}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || lines.length === 0}>
          {pending
            ? "กำลังบันทึก…"
            : editing
              ? "บันทึกการแก้ไข"
              : "บันทึกบิล / ออกใบเสร็จ"}
        </Button>
        <Link href={editing ? `/admin/bills/${initial!.billId}` : "/admin/bills"}>
          <Button type="button" variant="secondary">
            ยกเลิก
          </Button>
        </Link>
      </div>
    </form>
  );
}

function TotalRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        bold ? "border-t border-slate-200 pt-1 text-base font-bold text-slate-900" : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
