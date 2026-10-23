import { describe, expect, it } from "vitest";
import { filterPortfolioProjects } from "../src/lib/portfolio/filter-projects";
import type { PortfolioProject } from "../src/lib/portfolio/types";

const projects: PortfolioProject[] = [
  {
    id: "1",
    title: "Data workbook",
    slug: "data-workbook",
    summary: "An organized spreadsheet.",
    category: "Data",
    featured: false,
    thumbnailUrl: null,
    thumbnailAlt: null,
    description: null,
    problem: null,
    approach: null,
    solution: null,
    tools: ["Excel"],
    verifiedResults: [],
    screenshots: [],
    liveUrl: null,
    sourceUrl: null,
    seoTitle: null,
    seoDescription: null,
    relatedProjects: [],
  },
  {
    id: "2",
    title: "Website review",
    slug: "website-review",
    summary: "An SEO-focused review.",
    category: "Marketing",
    featured: false,
    thumbnailUrl: null,
    thumbnailAlt: null,
    description: null,
    problem: null,
    approach: null,
    solution: null,
    tools: ["Analytics"],
    verifiedResults: [],
    screenshots: [],
    liveUrl: null,
    sourceUrl: null,
    seoTitle: null,
    seoDescription: null,
    relatedProjects: [],
  },
];

describe("filterPortfolioProjects", () => {
  it("filters by category", () => {
    expect(
      filterPortfolioProjects(projects, "Data", "").map((project) => project.slug),
    ).toEqual(["data-workbook"]);
  });

  it("searches project text and tools without case sensitivity", () => {
    expect(
      filterPortfolioProjects(projects, "All", "excel").map((project) => project.slug),
    ).toEqual(["data-workbook"]);
  });

  it("combines filters and returns no unrelated projects", () => {
    expect(filterPortfolioProjects(projects, "Data", "seo")).toEqual([]);
  });
});
