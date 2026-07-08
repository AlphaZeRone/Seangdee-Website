-- Seangdee admin — initial schema, RLS, triggers, and storage bucket.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  -- New users default to 'pending' (NO admin access). The shop owner promotes
  -- them to 'staff' or 'admin' via SQL (see seed.sql). This prevents anyone who
  -- self-registers from gaining access to the admin area.
  role       text not null default 'pending' check (role in ('admin', 'staff', 'pending')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: is the current user a staff/admin? Defined AFTER profiles exists so
-- the SQL function body validates at creation. SECURITY DEFINER makes it run as
-- the owner (bypassing RLS inside the function), which also prevents infinite
-- recursion with the profiles SELECT policy below.
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- Users can read their own profile; staff can read all profiles.
create policy "read own or staff reads all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());

-- NOTE: there is intentionally NO self-update policy on profiles. Allowing a user
-- to UPDATE their own row would let them change their own `role` and escalate to
-- admin. Roles are managed only via the service_role key / SQL editor, which
-- bypass RLS. Add a scoped policy later if users need to edit their display name.

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_th    text not null,
  name_en    text not null,
  type       text not null check (type in ('cctv', 'internet', 'accessory')),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "staff read categories"
  on public.categories for select to authenticated using (public.is_staff());
create policy "staff write categories"
  on public.categories for insert to authenticated with check (public.is_staff());
create policy "staff update categories"
  on public.categories for update to authenticated using (public.is_staff());
create policy "staff delete categories"
  on public.categories for delete to authenticated using (public.is_staff());

-- ---------------------------------------------------------------------------
-- products  (the stock items)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  sku            text not null unique,
  name_th        text not null,
  name_en        text not null,
  description_th text,
  description_en text,
  category_id    uuid references public.categories (id) on delete set null,
  brand          text,
  cost_price     numeric(12, 2) not null default 0,
  sale_price     numeric(12, 2) not null default 0,
  quantity       integer not null default 0,
  reorder_level  integer not null default 0,
  unit           text not null default 'ชิ้น',
  status         text not null default 'active' check (status in ('active', 'inactive')),
  image_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);

alter table public.products enable row level security;

create policy "staff read products"
  on public.products for select to authenticated using (public.is_staff());
create policy "staff write products"
  on public.products for insert to authenticated with check (public.is_staff());
create policy "staff update products"
  on public.products for update to authenticated using (public.is_staff());
create policy "staff delete products"
  on public.products for delete to authenticated using (public.is_staff());

-- Keep updated_at fresh on every update.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- stock_movements  (audit trail; drives products.quantity)
-- ---------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change_qty integer not null,
  reason     text not null check (reason in ('purchase', 'sale', 'adjustment', 'return')),
  note       text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx
  on public.stock_movements (product_id, created_at desc);

alter table public.stock_movements enable row level security;

create policy "staff read stock movements"
  on public.stock_movements for select to authenticated using (public.is_staff());
create policy "staff write stock movements"
  on public.stock_movements for insert to authenticated with check (public.is_staff());

-- Applying a movement adjusts the product's quantity atomically.
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
     set quantity = quantity + new.change_qty
   where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_apply_stock_movement on public.stock_movements;
create trigger trg_apply_stock_movement
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ---------------------------------------------------------------------------
-- Storage bucket for product images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "staff upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "staff update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_staff());

create policy "staff delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_staff());
