-- Profiles mirror auth users and carry the application role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Consultations belong to exactly one student.
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 100),
  reason text not null check (char_length(btrim(reason)) between 1 and 2000),
  scheduled_at timestamptz not null,
  completed boolean not null default false,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index consultations_student_scheduled_idx
  on public.consultations (student_id, scheduled_at);

create index consultations_scheduled_idx
  on public.consultations (scheduled_at);

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cover users that existed before this migration.
insert into public.profiles (id, email)
select id, coalesce(email, '')
from auth.users
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger consultations_set_updated_at
  before update on public.consultations
  for each row execute function public.set_updated_at();

-- Admin checks bypass RLS but expose no data through the Data API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.consultations enable row level security;

create policy "Profiles are viewable by owner or admin"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "Consultations are viewable by owner or admin"
  on public.consultations
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "Students can create their own consultations"
  on public.consultations
  for insert
  to authenticated
  with check (student_id = (select auth.uid()));

create policy "Students can update their own consultations"
  on public.consultations
  for update
  to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- No DELETE policy: cancellation is a status update.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.consultations from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update on table public.consultations to authenticated;
