import { beforeEach, describe, expect, it, vi } from "vitest";

const getConfig = vi.hoisted(() => vi.fn());
const clientFactory = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/config", () => ({
  getSupabasePublicConfig: getConfig,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: clientFactory,
}));

import { GET } from "../src/app/cv.pdf/route";

function query(result: {
  data: unknown;
  error: { code?: string; name?: string } | null;
}) {
  const builder = {
    eq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    order: vi.fn(),
    select: vi.fn(),
  };
  builder.eq.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  return builder;
}

function setup({
  settings,
  resume,
  signedUrl = "https://storage.example/signed/cv?token=redacted",
}: {
  settings?: { data: unknown; error: { code?: string } | null };
  resume?: { data: unknown; error: { code?: string } | null };
  signedUrl?: string;
}) {
  const settingsQuery = query(
    settings ?? { data: { resume_asset_id: "resume-id" }, error: null },
  );
  const resumeQuery = query(
    resume ?? { data: { storage_path: "resume/cv.pdf" }, error: null },
  );
  const createSignedUrl = vi.fn().mockResolvedValue({
    data: { signedUrl },
    error: null,
  });
  const storageFrom = vi.fn().mockReturnValue({ createSignedUrl });
  const from = vi.fn((table: string) =>
    table === "site_settings" ? settingsQuery : resumeQuery,
  );

  getConfig.mockReturnValue({ url: "https://project.supabase.co", anonKey: "public" });
  clientFactory.mockResolvedValue({
    from,
    storage: { from: storageFrom },
  });

  return { settingsQuery, resumeQuery, createSignedUrl, from, storageFrom };
}

describe("published CV download route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not offer a CV when Supabase is not configured", async () => {
    getConfig.mockReturnValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("redirects to a short-lived signed attachment only for a published asset", async () => {
    const { settingsQuery, resumeQuery, createSignedUrl, from, storageFrom } =
      setup({});

    const response = await GET();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://storage.example/signed/cv?token=redacted",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(settingsQuery.eq).toHaveBeenNthCalledWith(1, "id", 1);
    expect(settingsQuery.eq).toHaveBeenNthCalledWith(2, "is_published", true);
    expect(resumeQuery.eq).toHaveBeenCalledWith("is_published", true);
    expect(storageFrom).toHaveBeenCalledWith("resume-documents");
    expect(createSignedUrl).toHaveBeenCalledWith(
      "resume/cv.pdf",
      300,
      { download: "Mahmudul-Hassan-Masum-CV.pdf" },
    );
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("returns not found and does not sign when no published CV exists", async () => {
    const { createSignedUrl } = setup({
      settings: { data: { resume_asset_id: null }, error: null },
      resume: { data: null, error: null },
    });

    const response = await GET();

    expect(response.status).toBe(404);
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it("returns a generic error if the database cannot verify publication", async () => {
    setup({
      settings: {
        data: null,
        error: { code: "XX000" },
      },
    });
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("XX000");
    expect(logger).toHaveBeenCalledWith(
      "Unable to look up the published CV.",
      { code: "XX000" },
    );
  });
});
