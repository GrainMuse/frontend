-- Let authenticated applicants withdraw their own active applications while
-- keeping all other status changes under administrator control.

create policy "applicants withdraw their own academy applications"
on public.academy_applications for update to authenticated
using (
  user_id = (select auth.uid())
  and status in ('submitted', 'reviewing', 'shortlisted')
)
with check (
  user_id = (select auth.uid())
  and status = 'withdrawn'
);
