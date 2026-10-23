import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authorization = vi.hoisted(() => vi.fn());
const clientFactory = vi.hoisted(() => vi.fn());
const tableFactory = vi.hoisted(() => vi.fn());
const revalidate = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: authorization,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: clientFactory,
}));
vi.mock("next/cache", () => ({
  revalidatePath: revalidate,
}));

import {
  createProject,
  deleteAdminContent,
  moveAdminContent,
  saveResearchPublication,
  saveExperience,
  updateContentOrder,
  updateProject,
} from "../src/lib/admin/data";

const validPublication = {
  source_url: "https://ieeexplore.ieee.org/document/11490554",
};
const validProject = {
  title: "Verified project",
  slug: "verified-project",
  summary: "A verified project summary.",
  status: "draft",
};
const validId = "a78b715a-0934-4a50-8b44-11b3e721ae88";

function query(result: {
  data: unknown;
  error: { code?: string; message: string } | null;
}) {
  return {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    order: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
  };
}

describe("mocked administrator editorial data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorization.mockResolvedValue(undefined);
    clientFactory.mockResolvedValue({ from: tableFactory });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a draft research record with only supplied optional metadata", async () => {
    const databaseQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockReturnValue(databaseQuery);

    await expect(
      saveResearchPublication(null, validPublication),
    ).resolves.toEqual({ id: validId });

    expect(tableFactory).toHaveBeenCalledWith("research_publications");
    expect(databaseQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...validPublication,
        title: null,
        authors: [],
        author_contribution: null,
        venue: null,
        publication_year: null,
        doi: null,
        is_published: false,
      }),
    );
    expect(revalidate).toHaveBeenCalledWith("/");
  });

  it.each([true, false])(
    "updates publication metadata and persists is_published=%s",
    async (isPublished) => {
      const databaseQuery = query({ data: { id: validId }, error: null });
      tableFactory.mockReturnValue(databaseQuery);

      await saveResearchPublication(validId, {
        ...validPublication,
        title: "Verified title",
        authors: ["Verified author"],
        is_published: isPublished,
      });

      expect(databaseQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Verified title",
          authors: ["Verified author"],
          is_published: isPublished,
        }),
      );
      expect(databaseQuery.eq).toHaveBeenCalledWith("id", validId);
    },
  );

  it("rejects unauthenticated publication writes before opening the database", async () => {
    authorization.mockRejectedValue(new Error("Access denied."));

    await expect(
      saveResearchPublication(null, validPublication),
    ).rejects.toThrow("Access denied.");
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("rejects invalid source URLs before authorization or database access", async () => {
    await expect(
      saveResearchPublication(null, {
        ...validPublication,
        source_url: "http://example.com/paper",
      }),
    ).rejects.toThrow();
    expect(authorization).not.toHaveBeenCalled();
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("returns a generic error and logs no database message content", async () => {
    const databaseQuery = query({
      data: null,
      error: { code: "XX000", message: "sensitive database detail" },
    });
    tableFactory.mockReturnValue(databaseQuery);
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      saveResearchPublication(null, validPublication),
    ).rejects.toThrow("The requested portfolio update could not be completed.");

    expect(logger).toHaveBeenCalledWith(
      "Administrator data operation failed: create research publication.",
      { code: "XX000" },
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      "sensitive database detail",
    );
  });

  it("keeps omitted project SEO fields out of unrelated update payloads", async () => {
    const databaseQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockReturnValue(databaseQuery);

    await updateProject(validId, validProject);

    expect(databaseQuery.update).toHaveBeenCalledWith(
      expect.not.objectContaining({
        seo_title: expect.anything(),
        seo_description: expect.anything(),
      }),
    );
  });

  it("saves supplied SEO metadata without changing its values", async () => {
    const databaseQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockReturnValue(databaseQuery);

    await updateProject(validId, {
      ...validProject,
      seo_title: "Search title",
      seo_description: "Search description.",
    });

    expect(databaseQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        seo_title: "Search title",
        seo_description: "Search description.",
      }),
    );
  });

  it("keeps experience dates when saving a flexible-period entry", async () => {
    const databaseQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockReturnValue(databaseQuery);

    await saveExperience(validId, {
      role: "Teaching role",
      organization: "Verified organization",
      kind: "teaching",
      period_label: "2023–Present",
      start_date: "2023-01-01",
      end_date: null,
      is_current: false,
      is_published: true,
    });

    expect(databaseQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "teaching",
        period_label: "2023–Present",
        start_date: "2023-01-01",
        end_date: null,
      }),
    );
  });

  it("validates research ordering and reorders publications through the data layer", async () => {
    const otherId = "d8c61cbd-88c2-42b3-b4e8-34a52fdcfb8c";
    const records = [
      { id: validId, display_order: 0 },
      { id: otherId, display_order: 1 },
    ];
    const orderBuilder = {
      order: vi.fn(),
    };
    orderBuilder.order
      .mockReturnValueOnce(orderBuilder)
      .mockResolvedValue({ data: records, error: null });
    const readQuery = {
      select: vi.fn().mockReturnValue(orderBuilder),
    };
    const updateQuery = {
      eq: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
    };
    tableFactory
      .mockReturnValueOnce(readQuery)
      .mockReturnValue(updateQuery);

    await expect(
      updateContentOrder("research_publications", validId, {
        display_order: -1,
      }),
    ).rejects.toThrow();
    expect(clientFactory).not.toHaveBeenCalled();

    await expect(
      moveAdminContent("research_publications", validId, "down"),
    ).resolves.toEqual({ moved: true });
    expect(updateQuery.update).toHaveBeenCalledTimes(2);
    expect(updateQuery.eq).toHaveBeenCalledTimes(2);
  });

  it("deletes a research publication through the allowlisted data-layer path", async () => {
    const databaseQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockReturnValue(databaseQuery);

    await expect(
      deleteAdminContent("research_publications", validId),
    ).resolves.toEqual({ id: validId });
    expect(tableFactory).toHaveBeenCalledWith("research_publications");
    expect(databaseQuery.delete).toHaveBeenCalled();
  });

  it("accepts uploaded project images only when a real image asset exists", async () => {
    const mediaQuery = query({
      data: { storage_bucket: "portfolio-media", media_type: "image/webp" },
      error: null,
    });
    const projectQuery = query({ data: { id: validId }, error: null });
    tableFactory.mockImplementation((table: string) =>
      table === "media_assets" ? mediaQuery : projectQuery,
    );

    await createProject({
      ...validProject,
      thumbnail_url: `portfolio-asset:${validId}`,
      thumbnail_alt: "Verified project image",
    });

    expect(tableFactory).toHaveBeenNthCalledWith(1, "media_assets");
    expect(tableFactory).toHaveBeenNthCalledWith(2, "projects");
    expect(projectQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        thumbnail_url: `portfolio-asset:${validId}`,
        thumbnail_alt: "Verified project image",
      }),
    );
  });

  it("rejects references to missing uploaded assets", async () => {
    const mediaQuery = query({ data: null, error: null });
    tableFactory.mockReturnValue(mediaQuery);

    await expect(
      createProject({
        ...validProject,
        thumbnail_url: `portfolio-asset:${validId}`,
        thumbnail_alt: "Verified project image",
      }),
    ).rejects.toThrow("Choose an existing portfolio image asset.");
    expect(tableFactory).toHaveBeenCalledWith("media_assets");
  });
});
