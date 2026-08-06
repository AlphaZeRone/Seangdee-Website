-- Storefront (customer-facing catalog)
-- ---------------------------------------------------------------------------
-- The base `public.products` table is staff-only and holds sensitive columns
-- (cost_price, supplier_id, reorder_level, exact stock quantity). Customers must
-- NOT see those. Instead of loosening RLS on the table, we expose a read-only
-- VIEW that contains ONLY customer-safe columns of ACTIVE products, with
-- category/brand names joined in and stock reduced to a boolean.
--
-- The view runs with the definer's rights (security_invoker = false) so it can
-- read the staff-only base tables while exposing nothing beyond the columns
-- listed here. Read access is granted to the public API roles (anon +
-- authenticated); the underlying tables stay locked down.

create or replace view public.storefront_products
with (security_invoker = false) as
  select
    p.id,
    p.sku,
    p.name_th,
    p.name_en,
    p.description_th,
    p.description_en,
    p.sale_price,
    p.unit,
    p.image_url,
    p.category_id,
    c.name_th as category_name_th,
    c.name_en as category_name_en,
    c.type    as category_type,
    c.slug    as category_slug,
    p.brand_id,
    b.name    as brand_name,
    (p.quantity > 0) as in_stock,
    p.created_at
  from public.products p
  left join public.categories c on c.id = p.category_id
  left join public.brands b on b.id = p.brand_id
  where p.status = 'active';

grant select on public.storefront_products to anon, authenticated;
