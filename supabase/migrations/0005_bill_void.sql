-- Phase 2 addendum: void / cancel a bill (ยกเลิกบิล).
-- Bills stay append-only for financial integrity — instead of deleting, we mark
-- the bill voided and return its sold stock. The INV-#### number stays in
-- sequence, and voided bills are excluded from sales summaries.

alter table public.bills
  add column if not exists voided_at   timestamptz,
  add column if not exists voided_by   uuid references auth.users (id) on delete set null,
  add column if not exists void_reason text;

-- Atomic void: locks the bill, blocks double-voiding, and writes a positive
-- 'return' movement for every line (restoring stock). The return movements carry
-- no unit_cost, so the weighted-average cost is left untouched (0003 behaviour).
create or replace function public.void_bill(p_bill_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bill record;
  v_item record;
  v_uid  uuid := auth.uid();
begin
  if not public.is_staff() then
    raise exception 'not authorized';
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
    raise exception 'bill already voided';
  end if;

  for v_item in
    select product_id, quantity
      from public.bill_items
     where bill_id = p_bill_id and product_id is not null
  loop
    insert into public.stock_movements (product_id, change_qty, reason, note, created_by)
    values (v_item.product_id, v_item.quantity, 'return',
            v_bill.bill_no || ' (ยกเลิกบิล)', v_uid);
  end loop;

  update public.bills
     set voided_at   = now(),
         voided_by   = v_uid,
         void_reason = nullif(p_reason, '')
   where id = p_bill_id;
end;
$$;
