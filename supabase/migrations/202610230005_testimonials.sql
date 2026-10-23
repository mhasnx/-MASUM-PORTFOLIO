create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null
    check (char_length(trim(author_name)) between 1 and 160),
  author_role text
    check (author_role is null or char_length(trim(author_role)) <= 160),
  organization text
    check (organization is null or char_length(trim(organization)) <= 160),
  quote text not null
    check (char_length(trim(quote)) between 1 and 5000),
  source_url text
    check (source_url is null or (char_length(source_url) <= 2048 and source_url ~ '^https?://')),
  display_order integer not null default 0
    check (display_order between 0 and 100000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_public_order_idx
  on public.testimonials (display_order, created_at desc)
  where is_published;

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "public read published testimonials"
  on public.testimonials for select to anon, authenticated
  using (is_published);
create policy "admins manage testimonials"
  on public.testimonials for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.testimonials from public, anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant select, insert, update, delete
  on public.testimonials to authenticated;
