import type { MetadataRoute } from "next";
import { getPortfolioContent } from "@/lib/portfolio/data";
import { getSiteOrigin } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPortfolioContent();
  const siteOrigin = getSiteOrigin(content.siteUrl);

  if (!siteOrigin) {
    return [];
  }

  return [
    { url: siteOrigin },
    { url: new URL("/projects", siteOrigin).toString() },
    ...content.projects.map((project) => ({
      url: new URL(`/projects/${project.slug}`, siteOrigin).toString(),
    })),
  ];
}
