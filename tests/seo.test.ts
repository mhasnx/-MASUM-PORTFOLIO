import { afterEach, describe, expect, it } from "vitest";
import {
  createPageMetadata,
  getProjectSeoMetadata,
  getSiteOrigin,
  serializeJsonLd,
} from "../src/lib/seo";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("SEO helpers", () => {
  it("uses project SEO values and falls back to the title and summary", () => {
    const project = {
      title: "Verified project",
      summary: "Verified project summary.",
      seoTitle: null,
      seoDescription: null,
    };

    expect(getProjectSeoMetadata(project, "Mahmudul Hassan Masum")).toEqual({
      title: "Verified project | Mahmudul Hassan Masum",
      description: "Verified project summary.",
    });
    expect(
      getProjectSeoMetadata(
        {
          ...project,
          seoTitle: "Search title",
          seoDescription: "Search description.",
        },
        "Mahmudul Hassan Masum",
      ),
    ).toEqual({
      title: "Search title",
      description: "Search description.",
    });
    expect(
      getProjectSeoMetadata(
        { ...project, seoTitle: " ", seoDescription: "" },
        "",
      ),
    ).toEqual({
      title: "Verified project | Portfolio",
      description: "Verified project summary.",
    });
  });

  it("uses only a configured site origin for canonical and social URLs", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const metadata = createPageMetadata({
      title: "Example project",
      description: "A verified project summary.",
      path: "/projects/example",
      siteUrl: "https://portfolio.example/path",
      siteName: "Portfolio",
      image: {
        url: "https://images.example/project.jpg",
        alt: "Project preview",
      },
      type: "article",
    });

    expect(metadata.metadataBase?.toString()).toBe("https://portfolio.example/");
    expect(metadata.alternates?.canonical).toBe(
      "https://portfolio.example/projects/example",
    );
    expect(metadata.openGraph).toMatchObject({
      siteName: "Portfolio",
      type: "article",
      url: "https://portfolio.example/projects/example",
      images: [
        {
          url: "https://images.example/project.jpg",
          alt: "Project preview",
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://images.example/project.jpg"],
    });
  });

  it("omits canonical URLs when no website URL is configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const metadata = createPageMetadata({
      title: "Portfolio",
      description: "A portfolio.",
    });

    expect(metadata.metadataBase).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph?.url).toBeUndefined();
  });

  it("rejects malformed configured website URLs", () => {
    expect(() => getSiteOrigin("not-a-url")).toThrow(
      "valid absolute URL",
    );
    expect(() => getSiteOrigin("ftp://portfolio.example")).toThrow(
      "HTTPS or HTTP",
    );
  });

  it("escapes script-closing characters in JSON-LD output", () => {
    const jsonLd = serializeJsonLd({
      description: "</script><script>alert(1)</script>",
    });

    expect(jsonLd).toContain("\\u003c/script>");
    expect(jsonLd).not.toContain("<script>");
  });
});
