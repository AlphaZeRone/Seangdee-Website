-- Customer-facing site: self-registration.
-- Customers sign up through the public site (email+password or Google) and get
-- the new 'customer' role. This is distinct from staff/admin (managed by the
-- owner via SQL) and is NOT recognised by public.is_staff(), so a customer can
-- never reach the admin area or any staff-only RLS-protected data.

-- 1) Allow the new role. (Keep 'pending' for backward-compat with any old rows.)
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'staff', 'customer', 'pending'));

-- 2) New sign-ups now default to 'customer' instead of 'pending'. Staff/admin are
--    still created by the owner and promoted via SQL (see seed.sql). A brand-new
--    account therefore has a real, usable customer identity — no 'pending' limbo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- NOTE: the existing profiles SELECT policy ("read own or staff reads all",
-- USING id = auth.uid() OR public.is_staff()) already lets a customer read their
-- own profile row, so no new policy is needed for the /account page. There is
-- still intentionally NO self-UPDATE policy, so a customer cannot change their
-- own role — role escalation stays impossible.
