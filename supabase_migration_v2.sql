-- 1. CLEAN UP: Remove old columns and add new ones to 'sessions'
alter table public.sessions 
drop column if exists notes,
drop column if exists image_url;

alter table public.sessions 
add column if not exists date date not null default CURRENT_DATE,
add column if not exists images text[] default array[]::text[];

-- 2. STORAGE: Create the bucket for BBQ photos
insert into storage.buckets (id, name, public) 
values ('session-images', 'session-images', true)
on conflict (id) do nothing;

-- 3. STORAGE POLICIES: Clean and recreate
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Public can view images" on storage.objects;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'session-images' and auth.role() = 'authenticated' );

create policy "Public can view images"
  on storage.objects for select
  using ( bucket_id = 'session-images' );
