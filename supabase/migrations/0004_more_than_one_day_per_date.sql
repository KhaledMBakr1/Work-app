-- A worker can work more than one day on the same date: after checking out,
-- they can check in again and that counts as a separate day.
-- Safe to run again.

alter table public.checkins drop constraint if exists checkins_worker_id_work_date_key;

create index if not exists checkins_worker_date_idx on public.checkins (worker_id, work_date);

-- Workers can only create a plain pending check-in for themselves, for today,
-- only once they belong to a business, and only when they have no open check-in.
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
    if exists (
      select 1 from public.checkins
      where worker_id = auth.uid()
        and checked_out_at is null
        and checked_in_at > now() - interval '20 hours'
    ) then
      raise exception 'already_checked_in';
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
