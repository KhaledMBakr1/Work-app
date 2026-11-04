-- Lets the admin count a day as half a day (0.5), next to 1, 1.5 and 2.
-- Run this once in the Supabase SQL Editor.

alter table public.checkins drop constraint if exists checkins_multiplier_check;
alter table public.checkins
  add constraint checkins_multiplier_check check (multiplier in (0.5, 1, 1.5, 2));
