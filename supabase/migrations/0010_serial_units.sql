-- Phase 2 addendum: per-unit serial tracking for warranty claims (Plan A).
-- A serialized product's physical units are recorded at receiving time, each
-- carrying the supplier it was ordered from — so a claim can be routed by SN.
-- Selling stays quantity-based; the units table is a parallel registry.

alter table public.products
  add column if not exists is_serialized boolean not null default false;

create table if not exists public.product_units (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  serial_number text not null,
  supplier_id   uuid references public.suppliers (id) on delete set null,
  unit_cost     numeric(12, 2),
  status        text not null default 'in_stock'
                check (status in ('in_stock', 'claimed', 'scrapped')),
  received_at   timestamptz not null default now(),
  claimed_at    timestamptz,
  claim_note    text,
  note          text,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (product_id, serial_number)
);

create index if not exists product_units_serial_idx on public.product_units (serial_number);
create index if not exists product_units_product_idx on public.product_units (product_id);
create index if not exists product_units_supplier_idx on public.product_units (supplier_id);

alter table public.product_units enable row level security;

create policy "staff read product units"
  on public.product_units for select to authenticated using (public.is_staff());
create policy "staff write product units"
  on public.product_units for insert to authenticated with check (public.is_staff());
create policy "staff update product units"
  on public.product_units for update to authenticated using (public.is_staff());
create policy "staff delete product units"
  on public.product_units for delete to authenticated using (public.is_staff());

-- Atomic serialized receiving: writes one +qty purchase movement (which updates
-- quantity + weighted-average cost via the existing trigger) and one unit row
-- per serial, all in one transaction. A duplicate serial aborts the whole thing.
create or replace function public.receive_units(
  p_product_id  uuid,
  p_serials     text[],
  p_supplier_id uuid,
  p_unit_cost   numeric,
  p_note        text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean text[];
  v_count integer;
  v_sn    text;
  v_uid   uuid := auth.uid();
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;

  select array_agg(t)
    into v_clean
    from (select trim(x) as t from unnest(p_serials) as x) s
   where t <> '';

  v_count := coalesce(array_length(v_clean, 1), 0);
  if v_count = 0 then
    raise exception 'no serials';
  end if;

  insert into public.stock_movements (product_id, change_qty, reason, unit_cost, note, created_by)
  values (p_product_id, v_count, 'purchase', p_unit_cost,
          coalesce(nullif(p_note, ''), 'รับเข้า (Serial)'), v_uid);

  foreach v_sn in array v_clean
  loop
    insert into public.product_units
      (product_id, serial_number, supplier_id, unit_cost, note, created_by)
    values (p_product_id, v_sn, p_supplier_id, p_unit_cost, nullif(p_note, ''), v_uid);
  end loop;

  return v_count;
end;
$$;
