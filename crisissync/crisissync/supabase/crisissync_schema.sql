create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'staff',
  home_location jsonb default '{"lat": null, "lng": null}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  location jsonb not null default '{"lat": null, "lng": null}'::jsonb,
  analysis jsonb not null,
  source text not null default 'text',
  status text not null default 'active',
  provider text not null default 'local',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  message text not null,
  update_type text not null default 'coordination',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.responder_alerts (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  channel text not null,
  target text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_updates enable row level security;
alter table public.responder_alerts enable row level security;

create policy "profiles self access"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "authenticated users can read incidents"
on public.incidents
for select
to authenticated
using (true);

create policy "authenticated users can create incidents"
on public.incidents
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "authenticated users can read updates"
on public.incident_updates
for select
to authenticated
using (true);

create policy "authenticated users can create updates"
on public.incident_updates
for insert
to authenticated
with check (auth.uid() = created_by or created_by is null);

create policy "authenticated users can read alerts"
on public.responder_alerts
for select
to authenticated
using (true);

create policy "authenticated users can create alerts"
on public.responder_alerts
for insert
to authenticated
with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
