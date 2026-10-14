-- Admin login: restrict content writes to an allowlist of admin users.
-- The public site shares this Supabase project (students can sign up), so being
-- "authenticated" is not enough — only users listed in public.admins can write.
--
-- To make someone an admin, create the user in Supabase → Authentication → Users,
-- then run:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'admin@example.com';

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can view own admin row" on public.admins;
create policy "Admins can view own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

grant select on table public.admins to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Content tables: public read stays, writes become admin-only.
do $$
declare
  t text;
begin
  foreach t in array array['semesters', 'subjects', 'resources', 'lessons'] loop
    execute format('drop policy if exists "public write %1$s" on public.%1$I', t);
    execute format('drop policy if exists "public update %1$s" on public.%1$I', t);
    execute format('drop policy if exists "public delete %1$s" on public.%1$I', t);

    execute format('revoke insert, update, delete on public.%I from anon', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);

    execute format('drop policy if exists "admin insert %1$s" on public.%1$I', t);
    execute format('drop policy if exists "admin update %1$s" on public.%1$I', t);
    execute format('drop policy if exists "admin delete %1$s" on public.%1$I', t);
    execute format(
      'create policy "admin insert %1$s" on public.%1$I for insert to authenticated with check (public.is_admin())', t);
    execute format(
      'create policy "admin update %1$s" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format(
      'create policy "admin delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Site settings: previously read-only (no update policy), so admin saves were silently ignored.
grant update on table public.site_settings to authenticated;

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage: "resources" bucket stays publicly readable, uploads/changes become admin-only.
drop policy if exists "public upload resource files" on storage.objects;
drop policy if exists "public update resource files" on storage.objects;
drop policy if exists "public delete resource files" on storage.objects;

drop policy if exists "admin upload resource files" on storage.objects;
drop policy if exists "admin update resource files" on storage.objects;
drop policy if exists "admin delete resource files" on storage.objects;

create policy "admin upload resource files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());
create policy "admin update resource files" on storage.objects
  for update to authenticated
  using (bucket_id = 'resources' and public.is_admin());
create policy "admin delete resource files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());
