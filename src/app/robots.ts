import type { MetadataRoute } from "next";
import { getPortfolioContent } from "@/lib/portfolio/data";
import { getSiteOrigin } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getPortfolioContent();
  const siteOrigin = getSiteOrigin(content.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: siteOrigin ? `${siteOrigin}/sitemap.xml` : undefined,
  };
}
