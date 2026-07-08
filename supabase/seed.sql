-- Seed baseline categories for Seangdee. Safe to run multiple times.

insert into public.categories (slug, name_th, name_en, type) values
  ('cctv-camera',    'กล้องวงจรปิด',          'CCTV Cameras',        'cctv'),
  ('cctv-package',   'ชุดกล้องวงจรปิด',        'CCTV Packages',       'cctv'),
  ('cctv-recorder',  'เครื่องบันทึก (DVR/NVR)', 'DVR / NVR Recorders', 'cctv'),
  ('internet-plan',  'แพ็กเกจอินเทอร์เน็ต',    'Internet Packages',   'internet'),
  ('router',         'เราเตอร์ / อุปกรณ์เครือข่าย', 'Routers & Network',  'accessory'),
  ('accessory',      'อุปกรณ์เสริม',           'Accessories',         'accessory')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Create your first ADMIN user:
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--      (set an email + password; tick "Auto Confirm User").
--   2. A profile row is auto-created by the on_auth_user_created trigger with
--      role = 'pending' (NO access yet — this is intentional).
--   3. Promote that user to admin by running (replace the email):
--
--        update public.profiles
--           set role = 'admin'
--         where id = (select id from auth.users where email = 'you@example.com');
--
-- SECURITY (recommended): disable public sign-ups so only you can add staff.
--   Dashboard → Authentication → Sign In / Providers → Email → turn OFF
--   "Allow new users to sign up". New accounts are powerless by default even
--   if this is left on, but disabling it is defense-in-depth.
-- ---------------------------------------------------------------------------
