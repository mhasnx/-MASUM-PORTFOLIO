alter table public.profiles
  add column professional_title text,
  add column phone text,
  add column primary_cta_text text,
  add column primary_cta_href text,
  add column secondary_cta_text text,
  add column secondary_cta_href text;

alter table public.site_settings
  add column website_url text,
  add column logo_url text,
  add column favicon_url text,
  add column footer_text text,
  add column theme_default text not null default 'light'
    check (theme_default in ('light', 'dark', 'system')),
  add column resume_asset_id uuid references public.resume_assets (id) on delete set null,
  add column analytics_enabled boolean not null default false,
  add column analytics_id text;

alter table public.skills
  add column description text,
  add column icon text,
  add column proficiency smallint
    check (proficiency is null or proficiency between 0 and 100);

alter table public.services
  add column icon text,
  add column is_available boolean not null default true;

alter table public.experiences
  add column kind text not null default 'work'
    check (kind in ('work', 'freelance', 'training', 'course', 'achievement')),
  add column external_url text,
  add column skills text[] not null default '{}';

alter table public.education
  add column external_url text,
  add column skills text[] not null default '{}';

alter table public.certifications
  add column kind text not null default 'certification'
    check (kind in ('certification', 'training', 'course', 'achievement')),
  add column description text,
  add column skills text[] not null default '{}';

create index experiences_kind_order_idx
  on public.experiences (kind, display_order);
create index certifications_kind_order_idx
  on public.certifications (kind, display_order);
