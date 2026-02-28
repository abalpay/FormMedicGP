create table if not exists public.rate_limit_windows (
  key text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (key, window_start)
);

create index if not exists idx_rate_limit_windows_updated_at
  on public.rate_limit_windows(updated_at);

alter table public.rate_limit_windows enable row level security;

revoke all on public.rate_limit_windows from public;
revoke all on public.rate_limit_windows from anon;
revoke all on public.rate_limit_windows from authenticated;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  request_limit integer,
  remaining integer,
  reset_at timestamptz,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_window_start timestamptz;
  v_reset_at timestamptz;
  v_request_count integer;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    raise exception 'p_key must be provided';
  end if;

  if p_limit is null or p_limit <= 0 then
    raise exception 'p_limit must be > 0';
  end if;

  if p_window_seconds is null or p_window_seconds <= 0 then
    raise exception 'p_window_seconds must be > 0';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );
  v_reset_at := v_window_start + make_interval(secs => p_window_seconds);

  insert into public.rate_limit_windows as rlw (key, window_start, request_count, updated_at)
  values (p_key, v_window_start, 1, v_now)
  on conflict (key, window_start)
  do update
    set request_count = rlw.request_count + 1,
        updated_at = excluded.updated_at
  returning request_count into v_request_count;

  delete from public.rate_limit_windows
  where key = p_key
    and window_start < (v_window_start - make_interval(secs => p_window_seconds * 4));

  return query
  select
    (v_request_count <= p_limit) as allowed,
    p_limit as request_limit,
    greatest(0, p_limit - v_request_count) as remaining,
    v_reset_at as reset_at,
    case
      when v_request_count <= p_limit then 0
      else greatest(1, ceil(extract(epoch from (v_reset_at - v_now)))::integer)
    end as retry_after_seconds;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to anon;
grant execute on function public.check_rate_limit(text, integer, integer) to authenticated;
