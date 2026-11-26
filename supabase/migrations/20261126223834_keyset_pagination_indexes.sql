drop index if exists public.consultations_student_scheduled_idx;
drop index if exists public.consultations_scheduled_idx;

create index consultations_student_scheduled_id_idx
  on public.consultations (student_id, scheduled_at, id);

create index consultations_scheduled_id_idx
  on public.consultations (scheduled_at, id);
