-- Keep admins read-only even if they call the Data API directly.
drop policy if exists "Students can create their own consultations"
  on public.consultations;
drop policy if exists "Students can update their own consultations"
  on public.consultations;

create policy "Students can create their own consultations"
  on public.consultations
  for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    and not (select private.is_admin())
  );

create policy "Students can update their own consultations"
  on public.consultations
  for update
  to authenticated
  using (
    student_id = (select auth.uid())
    and not (select private.is_admin())
  )
  with check (
    student_id = (select auth.uid())
    and not (select private.is_admin())
  );
