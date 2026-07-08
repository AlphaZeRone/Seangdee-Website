-- Phase 2 addendum: edit an existing (non-voided) bill.
-- Mirrors create_bill but first reverses the original sale — a positive 'return'
-- movement per old line (fully auditable, avg cost untouched) — then re-applies
-- the new lines with fresh price/cost snapshots and sale movements, blocking
-- overselling, and recomputes VAT-inclusive totals. All in one transaction.

create or replace function public.update_bill(
  p_bill_id          uuid,
  p_items            jsonb,   -- [{"product_id":"uuid","quantity":3}, ...]
  p_is_tax_invoice   boolean,
  p_customer_name    text,
  p_customer_phone   text,
  p_customer_address text,
  p_customer_tax_id  text,
  p_note             text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bill     record;
  v_old      record;
  v_item     jsonb;
  v_qty      integer;
  v_prod     record;
  v_total    numeric(12, 2) := 0;
  v_subtotal numeric(12, 2);
  v_vat      numeric(12, 2);
  v_uid      uuid := auth.uid();
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'no items';
  end if;

  select id, bill_no, voided_at
    into v_bill
    from public.bills
   where id = p_bill_id
   for update;

  if not found then
    raise exception 'bill not found';
  end if;
  if v_bill.voided_at is not null then
    raise exception 'cannot edit a voided bill';
  end if;

  -- Reverse the original sale: return each old line's stock.
  for v_old in
    select product_id, quantity
      from public.bill_items
     where bill_id = p_bill_id and product_id is not null
  loop
    insert into public.stock_movements (product_id, change_qty, reason, note, created_by)
    values (v_old.product_id, v_old.quantity, 'return',
            v_bill.bill_no || ' (แก้ไขบิล)', v_uid);
  end loop;

  delete from public.bill_items where bill_id = p_bill_id;

  -- Re-apply the new lines against the restored stock.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'invalid quantity';
    end if;

    select id, sku, name_th, sale_price, cost_price, quantity, status
      into v_prod
      from public.products
     where id = (v_item ->> 'product_id')::uuid
     for update;

    if not found then
      raise exception 'product not found';
    end if;
    if v_prod.status <> 'active' then
      raise exception 'product % is not active', v_prod.name_th;
    end if;
    if v_prod.quantity < v_qty then
      raise exception 'insufficient stock for % (have %, need %)',
        v_prod.name_th, v_prod.quantity, v_qty;
    end if;

    insert into public.bill_items (
      bill_id, product_id, sku, name, unit_price, quantity, line_total,
      unit_cost_at_sale
    ) values (
      p_bill_id, v_prod.id, v_prod.sku, v_prod.name_th, v_prod.sale_price,
      v_qty, round(v_prod.sale_price * v_qty, 2), v_prod.cost_price
    );

    v_total := v_total + round(v_prod.sale_price * v_qty, 2);

    insert into public.stock_movements (product_id, change_qty, reason, note, created_by)
    values (v_prod.id, -v_qty, 'sale', v_bill.bill_no, v_uid);
  end loop;

  v_subtotal := round(v_total / 1.07, 2);
  v_vat := round(v_total - v_subtotal, 2);

  update public.bills
     set is_tax_invoice   = coalesce(p_is_tax_invoice, false),
         customer_name    = nullif(p_customer_name, ''),
         customer_phone   = nullif(p_customer_phone, ''),
         customer_address = nullif(p_customer_address, ''),
         customer_tax_id  = nullif(p_customer_tax_id, ''),
         note             = nullif(p_note, ''),
         subtotal         = v_subtotal,
         vat_amount       = v_vat,
         total            = v_total
   where id = p_bill_id;

  return p_bill_id;
end;
$$;
