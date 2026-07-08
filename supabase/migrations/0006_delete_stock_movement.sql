-- Phase 2 addendum: delete a stock movement (to correct a mis-entry).
-- Billing-owned movements — sales, and void-returns whose note is the INV-####
-- bill number — are blocked; void the bill instead so stock stays in sync.
-- After deleting, the product's quantity is reconciled and its weighted-average
-- cost is rebuilt from the remaining cost-bearing purchase movements.

create or replace function public.delete_stock_movement(p_movement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mov  record;
  v_qty  integer := 0;
  v_cost numeric(12, 2) := 0;
  v_saw  boolean := false;   -- did any cost-bearing purchase remain?
  r      record;
begin
  if not public.is_staff() then
    raise exception 'not authorized';
  end if;

  select id, product_id, reason, note
    into v_mov
    from public.stock_movements
   where id = p_movement_id
   for update;
  if not found then
    raise exception 'movement not found';
  end if;
  if v_mov.reason = 'sale' or v_mov.note like 'INV-%' then
    raise exception 'billing movement (void the bill instead)';
  end if;

  -- Lock the product row for the reconciliation below.
  perform 1 from public.products where id = v_mov.product_id for update;

  delete from public.stock_movements where id = p_movement_id;

  -- Replay the remaining movements in order to rebuild quantity + average cost,
  -- mirroring apply_stock_movement (0003): only positive movements carrying a
  -- unit_cost move the weighted average.
  for r in
    select change_qty, unit_cost
      from public.stock_movements
     where product_id = v_mov.product_id
     order by created_at asc, id asc
  loop
    if r.change_qty > 0 and r.unit_cost is not null then
      if v_qty + r.change_qty > 0 then
        v_cost := round(
          (v_qty * v_cost + r.change_qty * r.unit_cost) / (v_qty + r.change_qty),
          2
        );
      else
        v_cost := r.unit_cost;
      end if;
      v_saw := true;
    end if;
    v_qty := v_qty + r.change_qty;
  end loop;

  -- Keep the last known cost if no cost-bearing purchase remains (the product's
  -- seed cost from creation is preserved rather than reset to 0).
  update public.products
     set quantity   = v_qty,
         cost_price = case when v_saw then v_cost else cost_price end
   where id = v_mov.product_id;
end;
$$;
