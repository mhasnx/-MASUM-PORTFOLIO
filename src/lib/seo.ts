import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  siteUrl?: string | null;
  siteName?: string;
  image?: { url: string; alt: string } | null;
  type?: "website" | "article";
};

export function getProjectSeoMetadata(project: {
  title: string;
  summary: string;
  seoTitle: string | null;
  seoDescription: string | null;
}, profileName: string): { title: string; description: string } {
  const defaultTitle = profileName
    ? `${project.title} | ${profileName}`
    : `${project.title} | Portfolio`;

  return {
    title: project.seoTitle?.trim() || defaultTitle,
    description: project.seoDescription?.trim() || project.summary,
  };
}

export function getSiteOrigin(siteUrl?: string | null): string | null {
  const configuredSiteUrl = siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredSiteUrl) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(configuredSiteUrl);
  } catch {
    throw new Error("Configure NEXT_PUBLIC_SITE_URL or the published website URL as a valid absolute URL.");
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error("The configured website URL must use HTTPS or HTTP.");
  }

  return parsedUrl.origin;
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  siteUrl,
  siteName,
  image,
  type = "website",
}: PageMetadataOptions): Metadata {
  const siteOrigin = getSiteOrigin(siteUrl);
  const metadataBase = siteOrigin ? new URL(siteOrigin) : undefined;
  const canonicalUrl = siteOrigin ? new URL(path, siteOrigin).toString() : null;
  const socialImages = image
    ? [{ url: image.url, alt: image.alt }]
    : undefined;

  return {
    title,
    description,
    metadataBase,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type,
      siteName,
      url: canonicalUrl ?? undefined,
      images: socialImages,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: socialImages?.map(({ url }) => url),
    },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
