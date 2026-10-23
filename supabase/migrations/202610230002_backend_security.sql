create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
comment on schema private is 'Internal rate-limit state; not exposed through PostgREST.';

create table private.contact_rate_limits (
  identity_hash text not null,
  window_started_at timestamptz not null,
  attempt_count integer not null check (attempt_count > 0),
  primary key (identity_hash)
);
alter table private.contact_rate_limits enable row level security;
revoke all on private.contact_rate_limits from public, anon, authenticated, service_role;
create index contact_rate_limits_window_idx
  on private.contact_rate_limits (window_started_at);

create function private.consume_contact_rate_limit(
  p_identity_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_window timestamptz;
begin
  delete from private.contact_rate_limits
  where window_started_at <= now() - interval '1 day';

  insert into private.contact_rate_limits (
    identity_hash,
    window_started_at,
    attempt_count
  )
  values (
    p_identity_hash,
    now(),
    1
  )
  on conflict (identity_hash) do update
  set
    window_started_at = case
      when private.contact_rate_limits.window_started_at
        <= now() - interval '15 minutes'
      then now()
      else private.contact_rate_limits.window_started_at
    end,
    attempt_count = case
      when private.contact_rate_limits.window_started_at
        <= now() - interval '15 minutes'
      then 1
      else private.contact_rate_limits.attempt_count + 1
    end
  returning attempt_count, window_started_at
  into current_count, current_window;

  return current_count <= 5
    and current_window > now() - interval '15 minutes';
end;
$$;
revoke all on function private.consume_contact_rate_limit(text)
  from public, anon, authenticated, service_role;

create function public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_request_identity_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_name is null or char_length(trim(p_name)) not between 1 and 120
    or p_email is null
    or char_length(p_email) > 254
    or p_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
    or p_subject is null
    or char_length(trim(p_subject)) not between 1 and 160
    or p_message is null
    or char_length(trim(p_message)) not between 1 and 5000
    or p_request_identity_hash is null
    or p_request_identity_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception 'Invalid contact message.'
      using errcode = '22023';
  end if;

  if not private.consume_contact_rate_limit(p_request_identity_hash) then
    raise exception 'Contact submission rate limit exceeded.'
      using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, subject, message)
  values (trim(p_name), lower(trim(p_email)), trim(p_subject), trim(p_message));
end;
$$;
revoke all on function public.submit_contact_message(
  text,
  text,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.submit_contact_message(
  text,
  text,
  text,
  text,
  text
) to service_role;

drop policy if exists "public submit contact messages"
  on public.contact_messages;
revoke all on public.contact_messages from public, anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
