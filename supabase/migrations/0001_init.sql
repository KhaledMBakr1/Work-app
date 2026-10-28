-- Work days app: profiles, check-ins and access rules.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'worker' check (role in ('worker', 'admin')),
  created_at timestamptz not null default now()
);

create table public.checkins (
  id bigint generated always as identity primary key,
  worker_id uuid not null references public.profiles (id) on delete cascade,
  work_date date not null default current_date,
  checked_in_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  accuracy_m double precision,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  multiplier numeric(2, 1) not null default 1 check (multiplier in (1, 1.5, 2)),
  note text,
  place text,
  client text,
  paid boolean not null default false,
  paid_at timestamptz,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  unique (worker_id, work_date)
);

create index checkins_work_date_idx on public.checkins (work_date);

-- True when the signed-in user is an admin.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Every new sign-up gets a worker profile.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Workers can only create a plain pending check-in for themselves, for today.
create function public.guard_worker_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.worker_id := auth.uid();
    new.work_date := current_date;
    new.checked_in_at := now();
    new.status := 'pending';
    new.multiplier := 1;
    new.note := null;
    new.place := null;
    new.client := null;
    new.paid := false;
    new.paid_at := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

create trigger checkins_guard_insert
  before insert on public.checkins
  for each row execute function public.guard_worker_checkin();

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

create policy "read own profile or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "admin updates profiles" on public.profiles
  for update using (public.is_admin());

create policy "read own checkins or admin" on public.checkins
  for select using (worker_id = auth.uid() or public.is_admin());

create policy "worker checks in" on public.checkins
  for insert with check (worker_id = auth.uid() or public.is_admin());

create policy "admin updates checkins" on public.checkins
  for update using (public.is_admin());

create policy "admin deletes checkins" on public.checkins
  for delete using (public.is_admin());
