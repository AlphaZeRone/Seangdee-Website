-- Phase 2 addendum: product suppliers (managed list, like brands) + barcode & SN.

create table if not exists public.suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;

create policy "staff read suppliers"
  on public.suppliers for select to authenticated using (public.is_staff());
create policy "staff write suppliers"
  on public.suppliers for insert to authenticated with check (public.is_staff());
create policy "staff update suppliers"
  on public.suppliers for update to authenticated using (public.is_staff());
create policy "staff delete suppliers"
  on public.suppliers for delete to authenticated using (public.is_staff());

-- Product fields: barcode, serial number, and a supplier FK.
alter table public.products
  add column if not exists barcode       text,
  add column if not exists serial_number text,
  add column if not exists supplier_id   uuid references public.suppliers (id) on delete set null;

create index if not exists products_barcode_idx on public.products (barcode);
create index if not exists products_supplier_idx on public.products (supplier_id);
