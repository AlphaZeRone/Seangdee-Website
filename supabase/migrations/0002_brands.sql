-- Phase 2 (1/3): Brands as a managed list (replaces the free-text product.brand).

create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;

create policy "staff read brands"
  on public.brands for select to authenticated using (public.is_staff());
create policy "staff write brands"
  on public.brands for insert to authenticated with check (public.is_staff());
create policy "staff update brands"
  on public.brands for update to authenticated using (public.is_staff());
create policy "staff delete brands"
  on public.brands for delete to authenticated using (public.is_staff());

-- Swap products.brand (text) for a foreign key to brands.
-- NOTE: any brand text on existing test products is dropped — re-select from the
-- new dropdown after seeding brands.
alter table public.products drop column if exists brand;
alter table public.products
  add column if not exists brand_id uuid references public.brands (id) on delete set null;
create index if not exists products_brand_idx on public.products (brand_id);
