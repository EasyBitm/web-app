create table if not exists public.site_settings (
  id text primary key,
  course_structure_url text
);

alter table public.site_settings enable row level security;

create policy "Anyone can view site settings"
  on public.site_settings for select
  using (true);

grant select on table public.site_settings to anon;
grant select on table public.site_settings to authenticated;

insert into public.site_settings (id)
values ('global')
on conflict (id) do nothing;
