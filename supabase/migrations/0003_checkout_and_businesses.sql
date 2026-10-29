-- Check-out with time and location, and separate businesses with invite codes.
-- Safe to run more than once.

-- Work days follow Israel's calendar, not the database's UTC clock.
create or replace function public.local_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Jerusalem')::date;
$$;

-- ---------------------------------------------------------------------------
-- Businesses
-- ---------------------------------------------------------------------------

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists business_id uuid references public.businesses (id) on delete set null;

-- Everyone who signed up before businesses existed goes into one business.
do $$
declare
  b uuid;
begin
  if exists (select 1 from public.profiles where business_id is null)
     and not exists (select 1 from public.businesses) then
    insert into public.businesses (name) values ('My business') returning id into b;
    update public.profiles set business_id = b where business_id is null;
  end if;
end;
$$;

create or replace function public.my_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and business_id is not null
  );
$$;

-- True when the signed-in user is an admin of the given person's business.
create or replace function public.is_admin_of(person uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles me
    join public.profiles p on p.business_id = me.business_id
    where me.id = auth.uid() and me.role = 'admin' and me.business_id is not null and p.id = person
  );
$$;

-- New accounts either join a business with an invite code (as a worker)
-- or create a new business (as its admin).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  b uuid;
  r text := 'worker';
begin
  if coalesce(meta ->> 'invite_code', '') <> '' then
    select id into b from public.businesses where invite_code = meta ->> 'invite_code';
  elsif coalesce(trim(meta ->> 'business_name'), '') <> '' then
    insert into public.businesses (name) values (trim(meta ->> 'business_name')) returning id into b;
    r := 'admin';
  end if;

  insert into public.profiles (id, full_name, phone, business_id, role)
  values (new.id, coalesce(meta ->> 'full_name', ''), meta ->> 'phone', b, r);
  return new;
end;
$$;

-- Lets the join page show the business name before someone signs up.
create or replace function public.business_name_for_invite(code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select name from public.businesses where invite_code = code;
$$;

-- For signed-in people who don't belong to a business yet.
create or replace function public.join_business(code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b uuid;
begin
  if public.my_business_id() is not null then
    raise exception 'already_in_business';
  end if;
  select id into b from public.businesses where invite_code = code;
  if b is null then
    raise exception 'invalid_invite';
  end if;
  update public.profiles set business_id = b, role = 'worker' where id = auth.uid();
end;
$$;

create or replace function public.create_business(business_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b uuid;
begin
  if public.my_business_id() is not null then
    raise exception 'already_in_business';
  end if;
  if coalesce(trim(business_name), '') = '' then
    raise exception 'name_required';
  end if;
  insert into public.businesses (name) values (trim(business_name)) returning id into b;
  update public.profiles set business_id = b, role = 'admin' where id = auth.uid();
end;
$$;

create or replace function public.regenerate_invite_code()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  update public.businesses
  set invite_code = substr(md5(gen_random_uuid()::text), 1, 10)
  where id = public.my_business_id();
end;
$$;

-- ---------------------------------------------------------------------------
-- Check-out
-- ---------------------------------------------------------------------------

alter table public.checkins
  add column if not exists checked_out_at timestamptz,
  add column if not exists out_latitude double precision,
  add column if not exists out_longitude double precision,
  add column if not exists out_accuracy_m double precision;

-- Each check-in belongs to the business the worker was in at the time, so the
-- business keeps its history even if the worker leaves.
alter table public.checkins
  add column if not exists business_id uuid references public.businesses (id) on delete cascade;

update public.checkins c
set business_id = p.business_id
from public.profiles p
where p.id = c.worker_id and c.business_id is null;

create index if not exists checkins_business_idx on public.checkins (business_id, work_date);

-- Closes the worker's open check-in from the last 20 hours.
create or replace function public.check_out(lat double precision, lng double precision, accuracy double precision)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  open_id bigint;
begin
  select id into open_id
  from public.checkins
  where worker_id = auth.uid()
    and checked_out_at is null
    and checked_in_at > now() - interval '20 hours'
  order by checked_in_at desc
  limit 1;

  if open_id is null then
    raise exception 'no_open_checkin';
  end if;

  update public.checkins
  set checked_out_at = now(), out_latitude = lat, out_longitude = lng, out_accuracy_m = accuracy
  where id = open_id;
end;
$$;

-- Workers can only create a plain pending check-in for themselves, for today,
-- and only once they belong to a business.
create or replace function public.guard_worker_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if public.my_business_id() is null then
      raise exception 'no_business';
    end if;
    new.worker_id := auth.uid();
    new.business_id := public.my_business_id();
    new.work_date := public.local_today();
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
    new.checked_out_at := null;
    new.out_latitude := null;
    new.out_longitude := null;
    new.out_accuracy_m := null;
  else
    new.business_id := public.my_business_id();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Access rules: admins only see their own business.
-- ---------------------------------------------------------------------------

alter table public.businesses enable row level security;

drop policy if exists "members read their business" on public.businesses;
create policy "members read their business" on public.businesses
  for select using (id = public.my_business_id());

drop policy if exists "admins rename their business" on public.businesses;
create policy "admins rename their business" on public.businesses
  for update using (public.is_admin() and id = public.my_business_id());

drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin_of(id));

drop policy if exists "admin updates profiles" on public.profiles;
create policy "admin updates profiles" on public.profiles
  for update using (public.is_admin_of(id))
  with check (business_id is null or business_id = public.my_business_id());

drop policy if exists "read own checkins or admin" on public.checkins;
create policy "read own checkins or admin" on public.checkins
  for select using (
    worker_id = auth.uid() or (public.is_admin() and business_id = public.my_business_id())
  );

drop policy if exists "worker checks in" on public.checkins;
create policy "worker checks in" on public.checkins
  for insert with check (worker_id = auth.uid() or public.is_admin_of(worker_id));

drop policy if exists "admin updates checkins" on public.checkins;
create policy "admin updates checkins" on public.checkins
  for update using (public.is_admin() and business_id = public.my_business_id());

drop policy if exists "admin deletes checkins" on public.checkins;
create policy "admin deletes checkins" on public.checkins
  for delete using (public.is_admin() and business_id = public.my_business_id());

revoke execute on function public.check_out(double precision, double precision, double precision) from public, anon;
revoke execute on function public.join_business(text) from public, anon;
revoke execute on function public.create_business(text) from public, anon;
revoke execute on function public.regenerate_invite_code() from public, anon;
grant execute on function public.check_out(double precision, double precision, double precision) to authenticated;
grant execute on function public.join_business(text) to authenticated;
grant execute on function public.create_business(text) to authenticated;
grant execute on function public.regenerate_invite_code() to authenticated;
grant execute on function public.business_name_for_invite(text) to anon, authenticated;
grant select, update on public.businesses to authenticated;
