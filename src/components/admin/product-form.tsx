"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Brand, Category, Product, Supplier } from "@/lib/types";
import { CATEGORY_TYPE_LABELS } from "@/lib/types";
import type { FormState } from "@/lib/form";
import { formatBaht } from "@/lib/utils";
import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";

export function ProductForm({
  categories,
  brands,
  suppliers,
  product,
  action,
  submitLabel,
}: {
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  product?: Product;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(product);
  const [serialized, setSerialized] = useState(product?.is_serialized ?? false);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sku">SKU / รหัสสินค้า *</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
          <FieldError messages={state?.fieldErrors?.sku} />
        </div>
        <div>
          <Label htmlFor="barcode">บาร์โค้ด / Barcode</Label>
          <Input
            id="barcode"
            name="barcode"
            defaultValue={product?.barcode ?? ""}
            placeholder="เช่น 8850000123456"
          />
          <FieldError messages={state?.fieldErrors?.barcode} />
        </div>
        {!serialized && (
          <div>
            <Label htmlFor="serial_number">Serial Number (SN)</Label>
            <Input
              id="serial_number"
              name="serial_number"
              defaultValue={product?.serial_number ?? ""}
              placeholder="หมายเลขซีเรียล"
            />
            <FieldError messages={state?.fieldErrors?.serial_number} />
          </div>
        )}
        <div>
          <Label htmlFor="brand_id">แบรนด์ / Brand</Label>
          <Select
            id="brand_id"
            name="brand_id"
            defaultValue={product?.brand_id ?? ""}
          >
            <option value="">— ไม่ระบุ —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <FieldError messages={state?.fieldErrors?.brand_id} />
        </div>
        <div>
          <Label htmlFor="supplier_id">ผู้จำหน่าย / Supplier</Label>
          <Select
            id="supplier_id"
            name="supplier_id"
            defaultValue={product?.supplier_id ?? ""}
          >
            <option value="">— ไม่ระบุ —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <FieldError messages={state?.fieldErrors?.supplier_id} />
        </div>
        <div>
          <Label htmlFor="name_th">ชื่อสินค้า (ไทย) *</Label>
          <Input
            id="name_th"
            name="name_th"
            defaultValue={product?.name_th}
            required
          />
          <FieldError messages={state?.fieldErrors?.name_th} />
        </div>
        <div>
          <Label htmlFor="name_en">Product name (EN) *</Label>
          <Input
            id="name_en"
            name="name_en"
            defaultValue={product?.name_en}
            required
          />
          <FieldError messages={state?.fieldErrors?.name_en} />
        </div>
        <div>
          <Label htmlFor="category_id">หมวดหมู่ / Category</Label>
          <Select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
          >
            <option value="">— ไม่ระบุ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_th} ({CATEGORY_TYPE_LABELS[c.type]})
              </option>
            ))}
          </Select>
          <FieldError messages={state?.fieldErrors?.category_id} />
        </div>
        <div>
          <Label htmlFor="unit">หน่วยนับ / Unit *</Label>
          <Input
            id="unit"
            name="unit"
            defaultValue={product?.unit ?? "ชิ้น"}
            required
          />
          <FieldError messages={state?.fieldErrors?.unit} />
        </div>

        {isEdit ? (
          <div>
            <Label>ราคาทุนเฉลี่ย (คำนวณอัตโนมัติ)</Label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {formatBaht(product!.cost_price)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ต้นทุนเฉลี่ยถ่วงน้ำหนัก — ปรับอัตโนมัติเมื่อรับสินค้าเข้า
            </p>
          </div>
        ) : (
          <div>
            <Label htmlFor="cost_price">ราคาทุนเริ่มต้น (ต่อหน่วย) *</Label>
            <Input
              id="cost_price"
              name="cost_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={0}
              required
            />
            <FieldError messages={state?.fieldErrors?.cost_price} />
          </div>
        )}

        <div>
          <Label htmlFor="sale_price">ราคาขาย (บาท, รวม VAT) *</Label>
          <Input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.sale_price ?? 0}
            required
          />
          <FieldError messages={state?.fieldErrors?.sale_price} />
        </div>
        <div>
          <Label htmlFor="reorder_level">จุดสั่งซื้อ (แจ้งเตือนสต๊อกต่ำ)</Label>
          <Input
            id="reorder_level"
            name="reorder_level"
            type="number"
            min="0"
            defaultValue={product?.reorder_level ?? 0}
          />
          <FieldError messages={state?.fieldErrors?.reorder_level} />
        </div>
        <div>
          <Label htmlFor="status">สถานะ / Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={product?.status ?? "active"}
          >
            <option value="active">ใช้งาน</option>
            <option value="inactive">ปิดการขาย</option>
          </Select>
        </div>
        {!isEdit && !serialized && (
          <div>
            <Label htmlFor="initial_quantity">จำนวนเริ่มต้นในสต๊อก</Label>
            <Input
              id="initial_quantity"
              name="initial_quantity"
              type="number"
              min="0"
              defaultValue={0}
            />
            <p className="mt-1 text-xs text-slate-400">
              บันทึกเป็นการรับเข้าครั้งแรกที่ราคาทุนเริ่มต้นด้านบน
            </p>
          </div>
        )}
      </div>

      {/* Serialized toggle */}
      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <input
          type="checkbox"
          name="is_serialized"
          checked={serialized}
          onChange={(e) => setSerialized(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <span>
          <span className="font-medium text-slate-800">
            สินค้ามี Serial Number (ติดตามรายชิ้นเพื่อการเคลม)
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            เมื่อเปิดใช้ ให้รับเข้าสินค้าพร้อมกรอก Serial + ผู้จำหน่ายในหน้าสต๊อก —
            บาร์โค้ดยังใช้ร่วมกันทุกชิ้น ส่วน SN แยกรายชิ้น
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="description_th">รายละเอียด (ไทย)</Label>
          <Textarea
            id="description_th"
            name="description_th"
            rows={4}
            defaultValue={product?.description_th ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="description_en">Description (EN)</Label>
          <Textarea
            id="description_en"
            name="description_en"
            rows={4}
            defaultValue={product?.description_en ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">
          รูปสินค้า / Image {isEdit ? "(อัปโหลดใหม่เพื่อเปลี่ยน)" : ""}
        </Label>
        {product?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name_th}
            className="mb-2 h-24 w-24 rounded-lg object-cover"
          />
        )}
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก…" : submitLabel}
        </Button>
        <Link href="/admin/products">
          <Button type="button" variant="secondary">
            ยกเลิก
          </Button>
        </Link>
      </div>
    </form>
  );
}
