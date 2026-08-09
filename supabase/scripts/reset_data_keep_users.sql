-- =============================================================================
-- DESTRUCTIVE: full business-data reset — keeps user accounts
-- =============================================================================
-- Wipes every row of shop data (products, catalog master data, stock history,
-- serial units, bills) and returns bill numbering to INV-00001.
--
-- What SURVIVES:
--   • auth.users        — all logins (email, phone, Google) keep working
--   • public.profiles   — names and roles (admin/staff/customer) are untouched
--
-- What is DELETED:
--   • bills, bill_items          — all sales history and tax invoices
--   • stock_movements            — the whole stock ledger
--   • product_units              — serial numbers and their claim history
--   • products                   — the entire catalog (storefront goes empty)
--   • categories, brands, suppliers — master data, re-enter from scratch
--
-- THIS CANNOT BE UNDONE. Take a backup first:
--   Supabase Dashboard → Database → Backups → download the latest,
--   or Database → Backups → "Point in time" if enabled on your plan.
--
-- HOW TO RUN
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run.
--   Run it as a single execution: the BEGIN/COMMIT wrapper means a failure
--   anywhere rolls the entire thing back and nothing is lost.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1 (optional) — preview what you are about to destroy.
-- Run just this block on its own FIRST if you want to see the damage upfront.
-- -----------------------------------------------------------------------------
-- select 'bills'           as table_name, count(*) from public.bills
-- union all select 'bill_items',      count(*) from public.bill_items
-- union all select 'stock_movements', count(*) from public.stock_movements
-- union all select 'product_units',   count(*) from public.product_units
-- union all select 'products',        count(*) from public.products
-- union all select 'categories',      count(*) from public.categories
-- union all select 'brands',          count(*) from public.brands
-- union all select 'suppliers',       count(*) from public.suppliers
-- union all select 'profiles (KEPT)', count(*) from public.profiles;

-- -----------------------------------------------------------------------------
-- STEP 2 — the reset.
-- -----------------------------------------------------------------------------
begin;

-- One TRUNCATE for all eight tables so the foreign keys between them never
-- block the operation.
--
-- CASCADE is deliberately NOT used. Without it, Postgres refuses the statement
-- if some table outside this list still references one of these — which is the
-- safety net we want: an error instead of silently wiping an unlisted table.
-- `profiles` is not in the list and nothing here references it, so accounts and
-- roles are structurally safe.
--
-- TRUNCATE does not fire the row-level triggers on stock_movements, so
-- products.quantity is not double-adjusted on the way out; the products table
-- is emptied in the same statement anyway.
truncate table
  public.bill_items,
  public.bills,
  public.stock_movements,
  public.product_units,
  public.products,
  public.categories,
  public.brands,
  public.suppliers
restart identity;

-- Bill numbers come from a standalone sequence (`next_bill_no()` formats it as
-- INV-00001). RESTART IDENTITY above only resets sequences owned by a truncated
-- table's column, so this one has to be reset by hand.
alter sequence public.bill_seq restart with 1;

commit;

-- -----------------------------------------------------------------------------
-- STEP 3 — verify. Every business table should read 0; profiles should still
-- show your accounts, and next_bill_no should be INV-00001.
-- -----------------------------------------------------------------------------
select 'bills'           as table_name, count(*) as rows from public.bills
union all select 'bill_items',      count(*) from public.bill_items
union all select 'stock_movements', count(*) from public.stock_movements
union all select 'product_units',   count(*) from public.product_units
union all select 'products',        count(*) from public.products
union all select 'categories',      count(*) from public.categories
union all select 'brands',          count(*) from public.brands
union all select 'suppliers',       count(*) from public.suppliers
union all select '— profiles (KEPT)', count(*) from public.profiles
union all select '— auth.users (KEPT)', count(*) from auth.users;

-- Peek at the next bill number WITHOUT consuming it.
select 'INV-' || lpad(last_value::text, 5, '0') as next_bill_no
from public.bill_seq;

-- Confirm the roles survived.
select role, count(*) from public.profiles group by role order by role;

-- -----------------------------------------------------------------------------
-- STEP 4 (optional) — product images.
-- -----------------------------------------------------------------------------
-- Wiping `products` does NOT remove the image files themselves; every picture
-- uploaded to the `product-images` bucket is now orphaned. They are harmless
-- (nothing links to them) but they still take up storage quota.
--
-- BEST WAY: Dashboard → Storage → product-images → select all → Delete. That
-- removes the real files as well as their records.
--
-- The SQL below only deletes the DATABASE records. The underlying files stay in
-- object storage and become invisible/unreclaimable from the dashboard — so
-- prefer the dashboard route above, and use this only if you must:
--
-- delete from storage.objects where bucket_id = 'product-images';
