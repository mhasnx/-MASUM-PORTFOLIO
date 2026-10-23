import type { PortfolioProject } from "./types";

export function filterPortfolioProjects(
  projects: PortfolioProject[],
  category: string,
  search: string,
): PortfolioProject[] {
  const normalizedSearch = search.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesCategory =
      category === "All" || project.category === category;
    const searchableContent = [
      project.title,
      project.summary,
      project.category ?? "",
      ...project.tools,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesCategory &&
      (!normalizedSearch || searchableContent.includes(normalizedSearch))
    );
  });
}
