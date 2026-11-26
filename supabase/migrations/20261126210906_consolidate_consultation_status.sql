-- Cancelled remains terminal, so a cancelled row wins over a stale completed flag.
alter table public.consultations
  drop constraint if exists consultations_status_check;

update public.consultations
set status = 'completed'
where completed = true
  and status = 'scheduled';

alter table public.consultations
  add constraint consultations_status_check
  check (status in ('scheduled', 'completed', 'cancelled'));

alter table public.consultations
  drop column completed;
