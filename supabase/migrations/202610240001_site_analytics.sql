-- Run once in this project's Supabase SQL editor. No service-role key is needed in the website.
begin;

create table if not exists public.site_analytics_settings (
  singleton boolean primary key default true check (singleton),
  started_at timestamptz not null default now()
);
insert into public.site_analytics_settings (singleton) values (true) on conflict do nothing;

create table if not exists public.site_visits (
  id uuid primary key,
  visitor_id uuid not null,
  page text not null check (page in ('home', 'updates')),
  visited_at timestamptz not null default now()
);
create index if not exists site_visits_visitor_time_idx on public.site_visits (visitor_id, visited_at);
create index if not exists site_visits_time_idx on public.site_visits (visited_at);

alter table public.site_visits enable row level security;
alter table public.site_analytics_settings enable row level security;
revoke all on public.site_visits, public.site_analytics_settings from public, anon, authenticated;

create or replace function public.record_site_visit(p_event_id uuid, p_visitor_id uuid, p_page text)
returns void
language plpgsql
security definer
set search_path = ''
set statement_timeout = '5s'
as $$
begin
  if p_event_id is null or p_visitor_id is null or p_page is null or p_page not in ('home', 'updates') then
    raise exception 'Invalid visit' using errcode = '22023';
  end if;
  -- Bound accidental refresh loops per browser; this is not a bot-proof traffic service.
  if not pg_try_advisory_xact_lock(hashtextextended(p_visitor_id::text, 0)) then return; end if;
  if (select count(*) from public.site_visits
      where visitor_id = p_visitor_id and visited_at >= now() - interval '1 minute') >= 120 then return; end if;
  insert into public.site_visits (id, visitor_id, page)
    values (p_event_id, p_visitor_id, p_page) on conflict (id) do nothing;
end;
$$;
revoke all on function public.record_site_visit(uuid, uuid, text) from public;
grant execute on function public.record_site_visit(uuid, uuid, text) to anon, authenticated;

create or replace function public.get_site_analytics()
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '10s'
as $$
declare
  day_start timestamptz := date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong';
  result jsonb;
begin
  if not exists (
    select 1 from auth.users
    where id = auth.uid() and lower(email) = 'dragondance@lstc.edu.hk' and email_confirmed_at is not null
  ) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  -- ponytail: exact distinct counts suit this small site; add rollups if traffic makes this scan expensive.
  select jsonb_build_object(
    'total_visitors', count(distinct visitor_id),
    'total_views', count(*),
    'today_visitors', count(distinct visitor_id) filter (where visited_at >= day_start),
    'today_views', count(*) filter (where visited_at >= day_start),
    'started_at', (select started_at from public.site_analytics_settings where singleton),
    'generated_at', now()
  ) into result from public.site_visits;
  return result;
end;
$$;
revoke all on function public.get_site_analytics() from public, anon;
grant execute on function public.get_site_analytics() to authenticated;

notify pgrst, 'reload schema';
commit;
