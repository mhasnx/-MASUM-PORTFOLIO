create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(trim(name)) between 1 and 160),
  headline text,
  subtitle text,
  introduction text,
  biography text,
  professional_interests text[] not null default '{}',
  working_approach text[] not null default '{}',
  social_links jsonb not null default '[]'::jsonb
    check (jsonb_typeof(social_links) = 'array'),
  availability_label text,
  is_available boolean not null default false,
  avatar_url text,
  avatar_alt text,
  courses text[] not null default '{}',
  achievements text[] not null default '{}',
  email text,
  location text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_title text not null,
  default_description text not null,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'portfolio-media'
    check (storage_bucket in ('portfolio-media', 'resume-documents')),
  storage_path text not null,
  alt_text text,
  media_type text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.project_categories (id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  slug text not null unique,
  summary text not null check (char_length(trim(summary)) between 1 and 300),
  description text,
  category text,
  external_url text,
  source_url text,
  problem text,
  approach text,
  solution text,
  tools text[] not null default '{}',
  verified_results jsonb not null default '[]'::jsonb
    check (jsonb_typeof(verified_results) = 'array'),
  screenshots jsonb not null default '[]'::jsonb
    check (jsonb_typeof(screenshots) = 'array'),
  featured boolean not null default false,
  thumbnail_url text,
  thumbnail_alt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.skill_categories (id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  slug text not null unique,
  description text not null,
  deliverables text[] not null default '{}',
  price_amount numeric(12, 2) check (price_amount is null or price_amount >= 0),
  price_currency text check (
    price_currency is null or price_currency ~ '^[A-Z]{3}$'
  ),
  availability text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  description text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (not is_current or end_date is null)
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  qualification text not null,
  field_of_study text,
  description text,
  start_date date,
  end_date date,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  credential_url text,
  issued_on date,
  expires_on date,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_on is null or issued_on is null or expires_on >= issued_on)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ),
  subject text not null check (char_length(trim(subject)) between 1 and 160),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  status text not null default 'received'
    check (status in ('received', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table public.resume_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'resume-documents'
    check (storage_bucket = 'resume-documents'),
  storage_path text not null unique,
  file_name text not null,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_related (
  project_id uuid not null references public.projects (id) on delete cascade,
  related_project_id uuid not null references public.projects (id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (project_id, related_project_id),
  check (project_id <> related_project_id)
);

create index projects_public_order_idx
  on public.projects (display_order, published_at desc)
  where status = 'published';
create index projects_category_id_idx on public.projects (category_id);
create index projects_featured_idx
  on public.projects (display_order, published_at desc)
  where status = 'published' and featured;
create index skills_public_order_idx
  on public.skills (display_order)
  where is_published;
create index skills_category_id_idx on public.skills (category_id);
create index services_public_order_idx
  on public.services (display_order)
  where is_published;
create index experiences_public_order_idx
  on public.experiences (display_order, start_date desc)
  where is_published;
create index education_public_order_idx
  on public.education (display_order, start_date desc)
  where is_published;
create index certifications_public_order_idx
  on public.certifications (display_order, issued_on desc)
  where is_published;
create index contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index media_assets_published_idx
  on public.media_assets (storage_bucket, storage_path)
  where is_published;
create index resume_assets_published_idx
  on public.resume_assets (display_order, storage_path)
  where is_published;
create index project_related_related_project_id_idx
  on public.project_related (related_project_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
create trigger project_categories_set_updated_at before update on public.project_categories
for each row execute function public.set_updated_at();
create trigger skill_categories_set_updated_at before update on public.skill_categories
for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger skills_set_updated_at before update on public.skills
for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();
create trigger experiences_set_updated_at before update on public.experiences
for each row execute function public.set_updated_at();
create trigger education_set_updated_at before update on public.education
for each row execute function public.set_updated_at();
create trigger certifications_set_updated_at before update on public.certifications
for each row execute function public.set_updated_at();
create trigger resume_assets_set_updated_at before update on public.resume_assets
for each row execute function public.set_updated_at();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.project_categories enable row level security;
alter table public.skill_categories enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.services enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.certifications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.media_assets enable row level security;
alter table public.resume_assets enable row level security;
alter table public.project_related enable row level security;
alter table storage.objects enable row level security;

create policy "public read published profiles"
  on public.profiles for select to anon, authenticated
  using (is_published);
create policy "admins manage profiles"
  on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published site settings"
  on public.site_settings for select to anon, authenticated
  using (is_published);
create policy "admins manage site settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read categories with published projects"
  on public.project_categories for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.category_id = project_categories.id
        and projects.status = 'published'
    )
  );
create policy "admins manage project categories"
  on public.project_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read categories with published skills"
  on public.skill_categories for select to anon, authenticated
  using (
    exists (
      select 1 from public.skills
      where skills.category_id = skill_categories.id
        and skills.is_published
    )
  );
create policy "admins manage skill categories"
  on public.skill_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published projects"
  on public.projects for select to anon, authenticated
  using (status = 'published');
create policy "admins manage projects"
  on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "public read related published projects"
  on public.project_related for select to anon, authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_related.project_id
        and projects.status = 'published'
    )
    and exists (
      select 1 from public.projects
      where projects.id = project_related.related_project_id
        and projects.status = 'published'
    )
  );
create policy "admins manage related projects"
  on public.project_related for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published skills"
  on public.skills for select to anon, authenticated
  using (is_published);
create policy "admins manage skills"
  on public.skills for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published services"
  on public.services for select to anon, authenticated
  using (is_published);
create policy "admins manage services"
  on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published experiences"
  on public.experiences for select to anon, authenticated
  using (is_published);
create policy "admins manage experiences"
  on public.experiences for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published education"
  on public.education for select to anon, authenticated
  using (is_published);
create policy "admins manage education"
  on public.education for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published certifications"
  on public.certifications for select to anon, authenticated
  using (is_published);
create policy "admins manage certifications"
  on public.certifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (status = 'received');
create policy "admins manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published media assets"
  on public.media_assets for select to anon, authenticated
  using (is_published);
create policy "admins manage media assets"
  on public.media_assets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read published resume assets"
  on public.resume_assets for select to anon, authenticated
  using (is_published);
create policy "admins manage resume assets"
  on public.resume_assets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on
  public.profiles,
  public.site_settings,
  public.project_categories,
  public.skill_categories,
  public.projects,
  public.project_related,
  public.skills,
  public.services,
  public.experiences,
  public.education,
  public.certifications,
  public.media_assets,
  public.resume_assets
to anon, authenticated;
revoke all on public.admin_users from public, anon, authenticated;
revoke all on public.contact_messages from public, anon, authenticated;
grant insert (name, email, subject, message)
  on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.site_settings,
  public.project_categories,
  public.skill_categories,
  public.projects,
  public.skills,
  public.services,
  public.experiences,
  public.education,
  public.certifications,
  public.media_assets,
  public.resume_assets
to authenticated;
grant select, update, delete on public.contact_messages to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'portfolio-media',
    'portfolio-media',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'resume-documents',
    'resume-documents',
    false,
    10485760,
    array['application/pdf']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "read published portfolio media objects"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and exists (
      select 1 from public.media_assets
      where media_assets.storage_bucket = storage.objects.bucket_id
        and media_assets.storage_path = storage.objects.name
        and media_assets.is_published
    )
  );
create policy "read published resume objects"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'resume-documents'
    and exists (
      select 1 from public.resume_assets
      where resume_assets.storage_bucket = storage.objects.bucket_id
        and resume_assets.storage_path = storage.objects.name
        and resume_assets.is_published
    )
  );
create policy "admins manage portfolio storage"
  on storage.objects for all to authenticated
  using (
    public.is_admin()
    and bucket_id in ('portfolio-media', 'resume-documents')
  )
  with check (
    public.is_admin()
    and bucket_id in ('portfolio-media', 'resume-documents')
  );
