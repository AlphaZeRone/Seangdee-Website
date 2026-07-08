-- Phase 2 addendum: search bills by customer OR staff (creator) name.
-- bills.created_by → auth.users, and profiles.id → auth.users, so PostgREST
-- can't embed the staff name directly. This view joins the creator's full_name.
-- security_invoker = on so the caller's RLS on bills/profiles still applies
-- (staff read all; nobody else sees anything).

create or replace view public.bills_with_creator
with (security_invoker = on) as
select
  b.*,
  p.full_name as creator_name
from public.bills b
left join public.profiles p on p.id = b.created_by;
