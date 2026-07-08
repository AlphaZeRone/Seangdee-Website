# Supabase setup (Seangdee admin)

The admin app needs a Supabase project for its database, auth, and image storage.

## 1. Create the project
1. Go to <https://supabase.com> → **New project**. Pick a name (e.g. `seangdee`) and a strong DB password.
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 2. Configure env
Copy `.env.local.example` to `.env.local` in the project root and paste the values above.

## 3. Create the schema
Open **SQL Editor** in Supabase and run, in order:
1. `supabase/migrations/0001_init.sql` — tables, RLS, triggers, storage bucket.
2. `supabase/seed.sql` — baseline categories.

## 4. Create your first admin
1. **Authentication → Users → Add user** — set an email + password, tick **Auto Confirm User**.
2. A `profiles` row is created automatically. Promote it to admin in the SQL Editor:
   ```sql
   update public.profiles
      set role = 'admin'
    where id = (select id from auth.users where email = 'you@example.com');
   ```

## 5. Run the app
```bash
npm run dev
```
Visit <http://localhost:3000/admin/login> and sign in.

---
**Security note:** All tables use Row Level Security — only signed-in staff/admin
users can read or write. The browser only ever receives the `anon` key; the
`service_role` key must never be exposed client-side.
