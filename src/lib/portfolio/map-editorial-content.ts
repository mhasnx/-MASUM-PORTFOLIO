import type { Database } from "@/types/database";
import type {
  ExperienceItem,
  SupplementalPortfolioContent,
} from "./types";

type ExperienceRow = Pick<
  Database["public"]["Tables"]["experiences"]["Row"],
  | "role"
  | "organization"
  | "kind"
  | "description"
  | "period_label"
  | "start_date"
  | "end_date"
  | "is_current"
  | "is_published"
>;

type ResearchPublicationRow = Pick<
  Database["public"]["Tables"]["research_publications"]["Row"],
  "title" | "description" | "source_url" | "display_order" | "is_published"
>;

export function mapEditorialContent(
  publications: ResearchPublicationRow[],
  experienceRows: ExperienceRow[],
): {
  experience: ExperienceItem[];
  supplemental: Pick<
    SupplementalPortfolioContent,
    "researchReferences" | "teachingExperience" | "communityActivities"
  >;
} {
  const publishedExperiences = experienceRows.filter(
    (item) => item.is_published,
  );

  return {
    experience: publishedExperiences
      .filter((item) => item.kind === "work" || item.kind === "freelance")
      .map((item) => ({
        role: item.role,
        organization: item.organization,
        description: item.description,
        startDate: item.start_date,
        endDate: item.end_date,
        periodLabel: item.period_label,
        isCurrent: item.is_current,
      })),
    supplemental: {
      researchReferences: publications
        .filter((item) => item.is_published)
        .sort((left, right) => left.display_order - right.display_order)
        .map((item) => ({
          title: item.title ?? "Research reference",
          url: item.source_url,
          description: item.description ?? "",
        })),
      teachingExperience: publishedExperiences
        .filter((item) => item.kind === "teaching")
        .map((item) => ({
          title: item.role,
          period: item.period_label ?? "",
          description: item.description ?? "",
        })),
      communityActivities: publishedExperiences
        .filter(
          (item) =>
            item.kind === "leadership" || item.kind === "community",
        )
        .map((item) => ({
          title: item.role,
          role: item.description ?? "",
          organization: item.organization,
        })),
    },
  };
}
