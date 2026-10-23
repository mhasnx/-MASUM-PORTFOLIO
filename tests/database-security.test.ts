import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const initialMigration = readFileSync(
  new URL(
    "../supabase/migrations/202610230001_initial_portfolio_schema.sql",
    import.meta.url,
  ),
  "utf8",
);
const securityMigration = readFileSync(
  new URL(
    "../supabase/migrations/202610230002_backend_security.sql",
    import.meta.url,
  ),
  "utf8",
);
const cmsMigration = readFileSync(
  new URL(
    "../supabase/migrations/202610230003_admin_cms_fields.sql",
    import.meta.url,
  ),
  "utf8",
);
const supabaseConfig = readFileSync(
  new URL("../supabase/config.toml", import.meta.url),
  "utf8",
);

describe("database security policy source", () => {
  it("adds validated fields for CMS-managed content without relaxing RLS", () => {
    expect(cmsMigration).toMatch(/proficiency between 0 and 100/i);
    expect(cmsMigration).toMatch(
      /theme_default in \('light', 'dark', 'system'\)/i,
    );
    expect(cmsMigration).toMatch(
      /kind in \('work', 'freelance', 'training', 'course', 'achievement'\)/i,
    );
    expect(cmsMigration).toMatch(
      /resume_asset_id uuid references public\.resume_assets/i,
    );
    expect(cmsMigration).not.toMatch(/disable row level security/i);
  });

  it("limits public project reads to published projects", () => {
    expect(initialMigration).toMatch(
      /create policy "public read published projects"[\s\S]*?using \(status = 'published'\)/i,
    );
  });

  it("enables RLS on every portfolio table and keeps storage buckets private", () => {
    const portfolioTables = [
      ...initialMigration.matchAll(/create table public\.([a-z_]+)/gi),
    ].map((match) => match[1]);

    for (const table of portfolioTables) {
      expect(initialMigration).toMatch(
        new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      );
    }

    expect(initialMigration).toMatch(
      /'portfolio-media',\s*'portfolio-media',\s*false/i,
    );
    expect(initialMigration).toMatch(
      /'resume-documents',\s*'resume-documents',\s*false/i,
    );
    expect(initialMigration).toMatch(
      /create policy "public read published media assets"[\s\S]*?using \(is_published\)/i,
    );
  });

  it("does not grant public reads or direct inserts to private messages", () => {
    expect(initialMigration).toMatch(
      /revoke all on public\.contact_messages from public, anon, authenticated/i,
    );
    expect(securityMigration).toMatch(
      /revoke all on public\.contact_messages from public, anon, authenticated/i,
    );
    expect(securityMigration).toMatch(
      /grant select, update, delete on public\.contact_messages to authenticated/i,
    );
    expect(securityMigration).toMatch(
      /create function public\.submit_contact_message[\s\S]*?security definer/i,
    );
  });

  it("keeps rate-limit storage inaccessible to browser roles", () => {
    expect(securityMigration).toMatch(
      /alter table private\.contact_rate_limits enable row level security/i,
    );
    expect(securityMigration).toMatch(
      /revoke all on private\.contact_rate_limits from public, anon, authenticated, service_role/i,
    );
    expect(securityMigration).toMatch(
      /revoke all on function public\.submit_contact_message\([\s\S]*?from public, anon, authenticated/i,
    );
    expect(securityMigration).toMatch(
      /grant execute on function public\.submit_contact_message\([\s\S]*?to service_role/i,
    );
    expect(securityMigration).not.toMatch(
      /grant execute on function public\.submit_contact_message\([\s\S]*?to anon, authenticated/i,
    );
  });

  it("disables public sign-up and enables Supabase Auth sign-in throttling locally", () => {
    expect(supabaseConfig).toMatch(/enable_signup\s*=\s*false/i);
    expect(supabaseConfig).toMatch(/sign_in_sign_ups\s*=\s*10/i);
  });
});
