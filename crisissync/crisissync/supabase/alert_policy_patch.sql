acreate policy "authenticated users can create alerts"
on public.responder_alerts
for insert
to authenticated
with check (true);
