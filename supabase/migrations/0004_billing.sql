-- Phase 2 (3/3): VAT billing (bills + line items).

create sequence if not exists public.bill_seq;

-- Atomic bill-number generator: INV-00001, INV-00002, ...
create or replace function public.next_bill_no()
returns text
language sql
security definer
set search_path = public
as $$
  select 'INV-' || lpad(nextval('public.bill_seq')::text, 5, '0');
$$;

create table if not exists public.bills (
  id               uuid primary key default gen_random_uuid(),
  bill_no          text not null unique,
  is_tax_invoice   boolean not null default false,
  customer_name    text,
  customer_phone   text,
  customer_address text,
  customer_tax_id  text,
  vat_rate         numeric(5, 2) not null default 7,
  subtotal         numeric(12, 2) not null default 0,   -- ex-VAT base
  vat_amount       numeric(12, 2) not null default 0,
  total            numeric(12, 2) not null default 0,   -- incl VAT
  note             text,
  created_by       uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now()
);

create index if not exists bills_created_idx on public.bills (created_at desc);

alter table public.bills enable row level security;

-- Bills are append-only (no update/delete policy) for financial integrity.
create policy "staff read bills"
  on public.bills for select to authenticated using (public.is_staff());
create policy "staff write bills"
  on public.bills for insert to authenticated with check (public.is_staff());

create table if not exists public.bill_items (
  id                uuid primary key default gen_random_uuid(),
  bill_id           uuid not null references public.bills (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  sku               text,
  name              text not null,          -- snapshot of product name at sale time
  unit_price        numeric(12, 2) not null, -- VAT-inclusive sale price at sale time
  quantity          integer not null,
  line_total        numeric(12, 2) not null,
  unit_cost_at_sale numeric(12, 2) not null default 0, -- avg cost snapshot for profit
  created_at        timestamptz not null default now()
);

create index if not exists bill_items_bill_idx on public.bill_items (bill_id);

alter table public.bill_items enable row level security;

create policy "staff read bill items"
  on public.bill_items for select to authenticated using (public.is_staff());
create policy "staff write bill items"
  on public.bill_items for insert to authenticated with check (public.is_staff());

-- Atomic sale: locks each product row, blocks overselling, snapshots price/cost,
-- computes VAT-inclusive totals, and writes bill + items + sale movements in one
-- transaction. Prices/costs come from the DB, never the client.
create or replace function public.create_bill(
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
  v_bill_id  uuid;
  v_bill_no  text;
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

  v_bill_no := public.next_bill_no();

  insert into public.bills (
    bill_no, is_tax_invoice, customer_name, customer_phone,
    customer_address, customer_tax_id, vat_rate, subtotal, vat_amount, total,
    note, created_by
  ) values (
    v_bill_no, coalesce(p_is_tax_invoice, false), nullif(p_customer_name, ''),
    nullif(p_customer_phone, ''), nullif(p_customer_address, ''),
    nullif(p_customer_tax_id, ''), 7, 0, 0, 0, nullif(p_note, ''), v_uid
  ) returning id into v_bill_id;

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
      v_bill_id, v_prod.id, v_prod.sku, v_prod.name_th, v_prod.sale_price,
      v_qty, round(v_prod.sale_price * v_qty, 2), v_prod.cost_price
    );

    v_total := v_total + round(v_prod.sale_price * v_qty, 2);

    insert into public.stock_movements (product_id, change_qty, reason, note, created_by)
    values (v_prod.id, -v_qty, 'sale', v_bill_no, v_uid);
  end loop;

  v_subtotal := round(v_total / 1.07, 2);
  v_vat := round(v_total - v_subtotal, 2);

  update public.bills
     set subtotal = v_subtotal, vat_amount = v_vat, total = v_total
   where id = v_bill_id;

  return v_bill_id;
end;
$$;
