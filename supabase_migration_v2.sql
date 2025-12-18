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

-- 4. PROFILES: Ensure avatar_url exists
alter table public.profiles
add column if not exists avatar_url text;

-- 5. STORAGE: Create the bucket for Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 6. STORAGE POLICIES for Avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
  
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );


-- 7. PROFILES: Ensure table exists (idempotent)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- 8. TRIGGERS: Handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. TRIGGERS: Prevent username changes
create or replace function public.prevent_username_change()
returns trigger
language plpgsql
as $$
begin
  if new.username is distinct from old.username then
    raise exception 'Username cannot be changed.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_update on public.profiles;
create trigger on_profile_update
  before update on public.profiles
  for each row execute procedure public.prevent_username_change();

