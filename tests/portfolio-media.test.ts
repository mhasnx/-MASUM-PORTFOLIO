import { describe, expect, it, vi } from "vitest";
import {
  isPortfolioImageReference,
  makePortfolioImageReference,
  parsePortfolioImageReference,
  resolvePortfolioImageReference,
} from "../src/lib/portfolio/media-reference";

const assetId = "a78b715a-0934-4a50-8b44-11b3e721ae88";
const reference = `portfolio-asset:${assetId}`;

describe("portfolio uploaded-image references", () => {
  it("creates and parses stable references without accepting arbitrary URLs", () => {
    expect(makePortfolioImageReference(assetId)).toBe(reference);
    expect(parsePortfolioImageReference(reference)).toBe(assetId);
    expect(isPortfolioImageReference(reference)).toBe(true);
    expect(parsePortfolioImageReference("https://example.com/image.jpg")).toBe(
      null,
    );
    expect(isPortfolioImageReference("portfolio-asset:not-an-id")).toBe(false);
    expect(() => makePortfolioImageReference("not-an-id")).toThrow(
      "valid uploaded portfolio image",
    );
  });

  it("resolves an uploaded image only when its published metadata is present", async () => {
    const createPublishedUrl = vi.fn(async (path: string) => `/signed/${path}`);

    await expect(
      resolvePortfolioImageReference(reference, new Map(), createPublishedUrl),
    ).resolves.toBeNull();
    expect(createPublishedUrl).not.toHaveBeenCalled();

    await expect(
      resolvePortfolioImageReference(
        reference,
        new Map([[assetId, "projects/portfolio.webp"]]),
        createPublishedUrl,
      ),
    ).resolves.toBe("/signed/projects/portfolio.webp");
    expect(createPublishedUrl).toHaveBeenCalledTimes(1);
  });

  it("preserves ordinary external image URLs and ignores malformed references", async () => {
    const createPublishedUrl = vi.fn(async () => "/signed/image.webp");

    await expect(
      resolvePortfolioImageReference(
        "https://images.example.com/project.webp",
        new Map(),
        createPublishedUrl,
      ),
    ).resolves.toBe("https://images.example.com/project.webp");
    await expect(
      resolvePortfolioImageReference(
        "portfolio-asset:malformed",
        new Map(),
        createPublishedUrl,
      ),
    ).resolves.toBeNull();
    expect(createPublishedUrl).not.toHaveBeenCalled();
  });
});
