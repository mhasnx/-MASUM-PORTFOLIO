alter table public.projects
  add column seo_title text
    check (seo_title is null or char_length(trim(seo_title)) between 1 and 70),
  add column seo_description text
    check (
      seo_description is null
      or char_length(trim(seo_description)) between 1 and 320
    );

alter table public.experiences
  alter column organization drop not null,
  add column period_label text
    check (period_label is null or char_length(trim(period_label)) between 1 and 120);

alter table public.experiences
  drop constraint experiences_kind_check,
  add constraint experiences_kind_check
    check (
      kind in (
        'work',
        'freelance',
        'training',
        'course',
        'achievement',
        'teaching',
        'leadership',
        'community'
      )
    );

create table public.research_publications (
  id uuid primary key default gen_random_uuid(),
  title text
    check (title is null or char_length(trim(title)) between 1 and 300),
  description text,
  authors text[] not null default '{}',
  author_contribution text,
  venue text,
  publication_year smallint
    check (publication_year is null or publication_year between 1800 and 2200),
  doi text,
  source_url text not null unique
    check (char_length(source_url) <= 2048 and source_url ~ '^https://'),
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index research_publications_public_order_idx
  on public.research_publications (display_order, publication_year desc)
  where is_published;

create trigger research_publications_set_updated_at
  before update on public.research_publications
  for each row execute function public.set_updated_at();

alter table public.research_publications enable row level security;

create policy "public read published research publications"
  on public.research_publications for select to anon, authenticated
  using (is_published);
create policy "admins manage research publications"
  on public.research_publications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.research_publications from public, anon, authenticated;
grant select on public.research_publications to anon, authenticated;
grant select, insert, update, delete
  on public.research_publications to authenticated;
