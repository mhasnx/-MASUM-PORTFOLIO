# Mahmudul Hassan Masum — Portfolio

An editorial portfolio built with Next.js App Router, TypeScript, Tailwind CSS 4, and Supabase. Without Supabase credentials, the public site uses clearly identified temporary starter fixtures; database-backed content, contact delivery, and admin sign-in require a configured Supabase project.

## Requirements

- Node.js 20.9 or newer and npm
- A Supabase project for database, authentication, and private storage
- Docker and the Supabase CLI for local database development

## Install and run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase configuration, the portfolio remains viewable and the contact form explains that delivery is not configured. Add the Supabase values below to enable database-backed features.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Configured public site origin used for canonical URLs, sitemap entries, and the robots sitemap reference. The published Site Settings website URL is also used. If neither is configured, canonical URLs and sitemap entries are omitted rather than guessed. |
| `NEXT_PUBLIC_SUPABASE_URL` | For Supabase features | Your Supabase project URL. Safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase features | Your Supabase anon/publishable key. Safe to expose; database access is constrained by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | For contact delivery | Secret server-only key used exclusively by the validated contact endpoint to call its single, database-constrained submission RPC. Never expose it to the browser. |

`.env.example` contains placeholders, not working credentials. Never commit `.env.local` or production secrets. Authenticated admin reads and writes use the session-bound server client and RLS; no general-purpose service-role database client is available in the application. Contact delivery is isolated in a server-only wrapper and can only invoke the narrowly granted contact RPC.

Published pages expose page-specific Open Graph and Twitter metadata. The sitemap includes the homepage, project listing, and published projects only; admin paths are disallowed for crawlers and admin pages are noindex. Configure the real public URL before deploying so canonical links and crawl metadata use the correct origin.

## Supabase database

The SQL migrations under `supabase/migrations/` are the schema source of truth. They define the portfolio models, indexes, timestamps, private storage buckets, and RLS policies. Research publications have a dedicated table; teaching and community records use the existing experiences table with explicit kinds and a flexible period label. Projects have optional SEO title and description fields. Public roles can read only published editorial records and cannot directly insert or read contact messages; the server-only contact RPC validates and rate-limits submissions. Unpublished portfolio data, administrator membership, contact messages, and unpublished media metadata are not publicly readable.

After changing migrations, regenerate the typed Supabase schema from the migrated local database:

```bash
supabase gen types typescript --local > src/types/database.ts
```

1. Install and start Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Start the local stack and apply migrations plus seed data:

   ```bash
   supabase start
   supabase db reset
   ```

3. Copy the local API URL and anon key printed by `supabase status` into `.env.local`.
4. For a linked hosted project, run `supabase link --project-ref <project-ref>` and `npm run db:push`. Run `supabase/seed.sql` in the Supabase SQL Editor if you also want the supplied starter profile in the hosted database.

The seed contains supplied starter profile, education, skill categories, service types, repository-backed projects, and editorial records. Conflicting seed rows are insert-only: rerunning the seed does not overwrite or unpublish administrator-edited content, and known education rows are inserted only if absent. Repository links are included without unverified live-demo URLs. The previous `my-portfolio` repository now appears as `basicdv`; its public page contains experience and impact claims awaiting owner review, so the portfolio project links only to source. ShieldLayer's code structure is described without claiming verified security efficacy or production readiness.

When Supabase is not configured, research, tutoring, community, and personal-interest content is provided by `src/lib/portfolio/supplemental-content.ts`. With Supabase configured, published research and teaching, leadership, and community records are loaded from the database and can be managed in the administrator CMS. Research metadata remains optional and should only be entered when verified. Interests remain source-controlled because the profile schema has an interests field but the CMS does not manage that property. The IEEE Xplore URL is shown as a reference only; its paper metadata and the user's authorship/contribution have not been verified.

### Provision an administrator

Public sign-up is disabled in the local Supabase configuration. For a hosted project, also disable public sign-ups in **Authentication → Settings → Allow new users to sign up**. Create the first Auth user through the Supabase Dashboard only, then run this statement in the SQL Editor using that user's Auth UUID:

```sql
insert into public.admin_users (user_id)
values ('<auth-user-uuid>');
```

The `admin_users` table has RLS enabled and no client-facing policies. Only a trusted database operator should provision administrators. Admin routes, server actions, uploads, and data-access functions verify the session and `is_admin()` allowlist function server-side; the Proxy refreshes sessions but is not the authorization boundary. Supabase Auth enforces sign-in throttling; local sign-in limits are set in `supabase/config.toml`. Confirm equivalent Auth rate limits are enabled in the hosted project's Auth settings.

#### Account recovery

There is no public registration or self-service administrator recovery route. A project owner should use the Supabase Dashboard to send an Auth password reset to the existing administrator, or disable the compromised Auth user and provision a replacement. Then verify or update that user's `admin_users` row using the SQL Editor with an authorized operator account. Never add an admin role from a browser, application form, or user-editable metadata. Review Auth logs and remove abandoned administrator allowlist entries after recovery.

The application uses Supabase's server-side cookie integration. The Proxy refreshes sessions; server routes and mutations re-verify the user and allowlist membership. Expired or invalid sessions return to the sign-in page. Set session lifetime and refresh-token policies in the hosted Supabase Auth settings to match your operational policy.

## Admin CMS

After an administrator has been provisioned and all migrations have been applied, sign in at `/admin`. The protected workspace provides database-backed project management (including draft/publication state, featured status, categories, related projects, ordering, SEO metadata, and uploaded thumbnails), skills and categories, services, experience entries (including teaching, leadership, and community), research publications, education, credentials, profile/site settings, private contact messages, and media/resume assets. Project gallery and verified-result fields are edited as validated JSON arrays; list fields use one item per line. Uploaded project images remain private until their media asset is published.

The dashboard totals, recent projects, and inbox rows are read from Supabase. Create, edit, publish, reorder, and delete actions use the authenticated server client and revalidate public portfolio paths. Missing Supabase configuration or unapplied migrations must be addressed before the CMS can load; missing profile or settings rows can be created in their respective forms. The optional analytics identifier is stored and validated by the CMS but is not injected as tracking code.

#### Contact abuse limits

Contact messages are written only through the server action and a server-only service-role wrapper calling one security-definer RPC. The RPC independently validates the message and limits each HMAC-derived client-address/email identity to five attempts per 15 minutes. Configure the hosting proxy to overwrite or reliably append `x-forwarded-for` (or the platform's trusted client-IP header); arbitrary client-supplied forwarding headers weaken IP-based rate limiting. Add a managed challenge/WAF if the public form becomes a spam target.

## Project structure

```text
src/
  app/
    actions/                 Public contact server action
    admin/                   Protected admin routes, actions, and sign-in
    projects/                Published project gallery
    projects/[slug]/         Published project details
    page.tsx                 Public portfolio homepage
  components/
    forms/                   Contact form
    portfolio/               Portfolio navigation, footer, and project gallery
    ui/                      Buttons, fields, dialogs, badges, notifications
  lib/
    auth/                    Server-side authorization
    admin/                   Session-authorized CMS data access
    portfolio/               Public portfolio data access and temporary fixtures
    supabase/                Browser, session-bound server, and narrow contact client
    validation.ts            Shared input validation
    seo.ts                   Metadata helpers
    storage.ts               Private bucket/signed URL helpers
  proxy.ts                   Supabase session refresh for admin requests
  types/database.ts          Supabase schema types
supabase/
  migrations/                Reproducible SQL schema, RLS, and rate limits
  seed.sql                   Supplied starter content only
tests/                       Validation, authorization, and policy regression tests
```

## Design system

The editorial palette, typography, layout widths, spacing, control sizing, borders, and focus styles are centralized in CSS custom properties in `src/app/globals.css`. Light is the baseline theme; an explicit choice is stored in local storage, otherwise the operating-system preference is used. Geist is loaded with `next/font`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Database commands (with the Supabase CLI installed):

```bash
npm run db:start
npm run db:reset
npm run db:push
```
