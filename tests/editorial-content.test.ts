import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapEditorialContent } from "../src/lib/portfolio/map-editorial-content";
import type { Database } from "../src/types/database";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202610230004_editorial_content.sql",
    import.meta.url,
  ),
  "utf8",
);
const seed = readFileSync(
  new URL("../supabase/seed.sql", import.meta.url),
  "utf8",
);

type ExperienceRow = Database["public"]["Tables"]["experiences"]["Row"];
type PublicationRow =
  Database["public"]["Tables"]["research_publications"]["Row"];

describe("editorial content schema and mapping", () => {
  it("maps published research, year-only teaching, and community records", () => {
    const mapped = mapEditorialContent(
      [
        {
          title: null,
          description: "Metadata and authorship remain unverified.",
          authors: [],
          author_contribution: null,
          venue: null,
          publication_year: null,
          doi: null,
          source_url: "https://ieeexplore.ieee.org/document/11490554",
          display_order: 1,
          is_published: true,
        },
      ] satisfies Pick<
        PublicationRow,
        | "title"
        | "description"
        | "authors"
        | "author_contribution"
        | "venue"
        | "publication_year"
        | "doi"
        | "source_url"
        | "display_order"
        | "is_published"
      >[],
      [
        {
          role: "Private Tutor — Classes 8–10",
          organization: null,
          kind: "teaching",
          description: "Tutoring description.",
          period_label: "2023–Present",
          start_date: null,
          end_date: null,
          is_current: false,
          is_published: true,
        },
        {
          role: "Science Club",
          organization: "KKFDM",
          kind: "leadership",
          description: "Former Vice-President",
          period_label: null,
          start_date: null,
          end_date: null,
          is_current: false,
          is_published: true,
        },
        {
          role: "Junior Developer",
          organization: "Verified Organization",
          kind: "work",
          description: null,
          period_label: null,
          start_date: "2025-01-01",
          end_date: null,
          is_current: true,
          is_published: true,
        },
      ] satisfies Pick<
        ExperienceRow,
        | "role"
        | "organization"
        | "kind"
        | "description"
        | "period_label"
        | "start_date"
        | "end_date"
        | "is_current"
        | "is_published"
      >[],
    );

    expect(mapped.supplemental.researchReferences).toEqual([
      {
        title: "Research reference",
        url: "https://ieeexplore.ieee.org/document/11490554",
        description: "Metadata and authorship remain unverified.",
        authors: [],
        authorContribution: null,
        venue: null,
        publicationYear: null,
        doi: null,
      },
    ]);
    expect(mapped.supplemental.teachingExperience[0].period).toBe(
      "2023–Present",
    );
    expect(mapped.supplemental.communityActivities[0]).toEqual({
      title: "Science Club",
      role: "Former Vice-President",
      organization: "KKFDM",
    });
    expect(mapped.experience).toEqual([
      {
        role: "Junior Developer",
        organization: "Verified Organization",
        description: null,
        startDate: "2025-01-01",
        endDate: null,
        periodLabel: null,
        isCurrent: true,
      },
    ]);
  });

  it("filters draft records in the data mapper", () => {
    const mapped = mapEditorialContent(
      [
        {
          title: "Unpublished",
          description: null,
          authors: [],
          author_contribution: null,
          venue: null,
          publication_year: null,
          doi: null,
          source_url: "https://example.com/draft",
          display_order: 1,
          is_published: false,
        },
      ],
      [
        {
          role: "Draft role",
          organization: null,
          kind: "community",
          description: null,
          period_label: null,
          start_date: null,
          end_date: null,
          is_current: false,
          is_published: false,
        },
      ],
    );

    expect(mapped.supplemental.researchReferences).toEqual([]);
    expect(mapped.experience).toEqual([]);
    expect(mapped.supplemental.teachingExperience).toEqual([]);
    expect(mapped.supplemental.communityActivities).toEqual([]);
  });

  it("renders only explicitly supplied publication metadata", () => {
    const mapped = mapEditorialContent(
      [
        {
          title: "Verified title",
          description: "Verified summary.",
          authors: ["Verified author"],
          author_contribution: "Verified contribution",
          venue: "Verified venue",
          publication_year: 2025,
          doi: "10.1234/example",
          source_url: "https://example.com/paper",
          display_order: 0,
          is_published: true,
        },
      ],
      [],
    );

    expect(mapped.supplemental.researchReferences[0]).toEqual({
      title: "Verified title",
      url: "https://example.com/paper",
      description: "Verified summary.",
      authors: ["Verified author"],
      authorContribution: "Verified contribution",
      venue: "Verified venue",
      publicationYear: 2025,
      doi: "10.1234/example",
    });
  });

  it("adds SEO fields and RLS-protected publication records without destructive SQL", () => {
    expect(migration).toMatch(/add column seo_title text/i);
    expect(migration).toMatch(/add column seo_description text/i);
    expect(migration).toMatch(
      /create table public\.research_publications[\s\S]*?source_url text not null unique/i,
    );
    expect(migration).toMatch(
      /alter table public\.research_publications enable row level security/i,
    );
    expect(migration).toMatch(
      /public read published research publications[\s\S]*?using \(is_published\)/i,
    );
    expect(migration).toMatch(
      /admins manage research publications[\s\S]*?public\.is_admin\(\)/i,
    );
    expect(migration).toMatch(
      /revoke all on public\.research_publications from public, anon, authenticated/i,
    );
    expect(migration).not.toMatch(/\b(drop table|truncate|delete from)\b/i);
  });

  it("keeps starter seeding insert-only on all conflicting rows", () => {
    const conflictClauses = [...seed.matchAll(/on conflict\b[\s\S]*?;/gi)].map(
      ([clause]) => clause,
    );

    expect(conflictClauses.length).toBeGreaterThan(0);
    expect(conflictClauses.every((clause) => /do nothing/i.test(clause))).toBe(
      true,
    );
    expect(seed).not.toMatch(/update\s+public\./i);
    expect(seed).toContain("2023–Present");
    expect(seed).toContain("11490554");
  });
});
