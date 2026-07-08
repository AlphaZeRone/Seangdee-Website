-- Phase 2 (2/3): Weighted moving-average cost.
-- Each stock-adding movement can carry the unit cost of that batch; products.cost_price
-- is recomputed as the weighted average of stock on hand.

alter table public.stock_movements
  add column if not exists unit_cost numeric(12, 2);

-- Replace the movement trigger function so positive movements with a unit_cost
-- update the weighted-average cost; all movements still adjust quantity.
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_qty  integer;
  old_cost numeric(12, 2);
  new_qty  integer;
begin
  select quantity, cost_price
    into old_qty, old_cost
    from public.products
   where id = new.product_id
   for update;

  new_qty := old_qty + new.change_qty;

  if new.change_qty > 0 and new.unit_cost is not null then
    update public.products
       set quantity = new_qty,
           cost_price = case
             when new_qty > 0 then
               round((old_qty * old_cost + new.change_qty * new.unit_cost) / new_qty, 2)
             else new.unit_cost
           end
     where id = new.product_id;
  else
    update public.products
       set quantity = new_qty
     where id = new.product_id;
  end if;

  return new;
end;
$$;

-- Trigger trg_apply_stock_movement already points at this function (from 0001) —
-- create-or-replace above is enough, no need to recreate the trigger.
