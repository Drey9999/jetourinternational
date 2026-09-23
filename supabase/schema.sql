-- ============================================================
-- JETOUR INTERNATIONAL LTD. -- SUPABASE SCHEMA
-- ============================================================
-- Run this once in the Supabase SQL editor for the project.
-- Safe to re-run: every statement is written to not error out
-- if the object already exists.
--
-- IMPORTANT SETUP STEP (do this in the Supabase dashboard, not SQL):
-- Authentication > Providers > Email > turn OFF "Allow new users
-- to sign up". Admin accounts should only ever be created manually
-- (Authentication > Users > Invite user) and then added to the
-- public.admins table below. Without this, anyone who discovers
-- the site could self-register a Supabase account; the is_admin()
-- allowlist keeps that from granting them anything even so, but
-- disabling public sign-up removes the risk entirely.
-- ============================================================


-- ------------------------------------------------------------
-- 1. ADMIN ALLOWLIST
-- ------------------------------------------------------------
-- Maps specific Supabase Auth users to admin access. Being
-- "authenticated" is not enough on its own; a user's id must be
-- listed here. There is no public policy on this table at all,
-- so it can only be read or written from the SQL editor or a
-- service-role key, never from the site itself.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- After creating an admin's login under Authentication > Users,
-- add them here, e.g.:
--   insert into public.admins (user_id)
--   values ('paste-the-user-uuid-here');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;


-- ------------------------------------------------------------
-- 2. ENQUIRIES
-- ------------------------------------------------------------
-- Every submission from the public contact form.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  enquiry_type text not null check (enquiry_type in ('vehicle', 'agriculture', 'livestock', 'general')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries"
  on public.enquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries"
  on public.enquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete enquiries" on public.enquiries;
create policy "Admins can delete enquiries"
  on public.enquiries for delete
  to authenticated
  using (public.is_admin());

-- Deleting an enquiry is permanent. The admin UI asks for confirmation
-- before calling this.


-- ------------------------------------------------------------
-- 3. SITE SETTINGS (logo, hero content, contact details)
-- ------------------------------------------------------------
-- One row per editable group, each holding a JSON object. This
-- mirrors the SITE_CONFIG object already used in js/config.js, so
-- the admin dashboard and the public site can both read from the
-- same shape of data. Rows are looked up by key:
--   branding          - company name, logo image URL
--   hero_automotive    - automotive hero slide: image, headline, subtext
--   hero_agriculture  - agriculture hero slide: image, headline, subtext
--   contact             - phone, WhatsApp, email, address, hours, social

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- The public site needs to read these values to render the hero
-- slides and contact details, so read access is open to everyone.
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert site settings" on public.site_settings;
create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete site settings" on public.site_settings;
create policy "Admins can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------
-- 4. STORAGE (logo + hero images)
-- ------------------------------------------------------------
-- A public bucket so uploaded images can be shown on the site via
-- a plain URL, but only admins can upload, replace or remove files.

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media"
  on storage.objects for select
  to public
  using (bucket_id = 'site-media');

drop policy if exists "Admins can upload site media" on storage.objects;
create policy "Admins can upload site media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can update site media" on storage.objects;
create policy "Admins can update site media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can delete site media" on storage.objects;
create policy "Admins can delete site media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());
