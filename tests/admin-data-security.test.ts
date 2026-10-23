import { beforeEach, describe, expect, it, vi } from "vitest";

const authorization = vi.hoisted(() => vi.fn());
const clientFactory = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: authorization,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: clientFactory,
}));

import {
  createProject,
  deleteAdminAsset,
  deleteAdminContent,
  deleteContactMessage,
  deleteProject,
  deleteRelatedProject,
  listAdminContent,
  moveAdminContent,
  saveCertification,
  saveEducation,
  saveExperience,
  saveProjectCategory,
  saveResearchPublication,
  saveRelatedProject,
  saveResumeAsset,
  saveService,
  saveSkill,
  saveSkillCategory,
  updateContactMessageStatus,
  updateContentOrder,
  updateMediaAsset,
  updatePortfolioProfile,
  updateProject,
  updateSiteSettings,
} from "../src/lib/admin/data";

const validProject = {
  title: "Verified project",
  slug: "verified-project",
  summary: "A real project description.",
  status: "draft",
};

describe("administrator data access boundary", () => {
  const validId = "a78b715a-0934-4a50-8b44-11b3e721ae88";

  beforeEach(() => {
    vi.clearAllMocks();
    clientFactory.mockResolvedValue({});
  });

  it.each(["unauthenticated", "authenticated non-admin"])(
    "does not create a database client for %s mutations",
    async () => {
      authorization.mockRejectedValue(new Error("Access denied."));

      await expect(createProject(validProject)).rejects.toThrow(
        "Access denied.",
      );
      await expect(
        deleteProject("a78b715a-0934-4a50-8b44-11b3e721ae88"),
      ).rejects.toThrow("Access denied.");
      await expect(listAdminContent("research_publications")).rejects.toThrow(
        "Access denied.",
      );
      expect(clientFactory).not.toHaveBeenCalled();
    },
  );

  it("rejects malformed project fields before a mutation can start", async () => {
    await expect(
      createProject({ ...validProject, slug: "../draft" }),
    ).rejects.toThrow();
    expect(authorization).not.toHaveBeenCalled();
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("rejects runtime table names outside the explicit mutation allowlist", async () => {
    await expect(
      deleteAdminContent("admin_users", validId),
    ).rejects.toThrow();
    expect(authorization).not.toHaveBeenCalled();
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it("rejects every CMS mutation before opening the database for non-admins", async () => {
    authorization.mockRejectedValue(new Error("Access denied."));
    const validProfile = {
      name: "Masum",
      headline: null,
      subtitle: null,
      introduction: null,
      biography: null,
      professional_interests: [],
      working_approach: [],
      social_links: [],
      availability_label: null,
      is_available: false,
      avatar_url: null,
      avatar_alt: null,
      courses: [],
      achievements: [],
      email: null,
      location: null,
      is_published: false,
    };
    const mutations = [
      createProject(validProject),
      createProject({
        ...validProject,
        thumbnail_url:
          "portfolio-asset:a78b715a-0934-4a50-8b44-11b3e721ae88",
        thumbnail_alt: "Project image",
      }),
      updateProject(validId, validProject),
      deleteProject(validId),
      saveProjectCategory(null, { name: "Category", slug: "category" }),
      saveSkillCategory(null, { name: "Category", slug: "category" }),
      saveSkill(null, { category_id: null, name: "Skill" }),
      saveService(null, {
        title: "Service",
        slug: "service",
        description: "A service.",
      }),
      saveExperience(null, { role: "Role", organization: "Organization" }),
      saveEducation(null, { institution: "University", qualification: "Degree" }),
      saveCertification(null, { name: "Credential", issuer: "Issuer" }),
      saveResearchPublication(null, {
        source_url: "https://example.com/paper",
      }),
      saveResearchPublication(validId, {
        source_url: "https://example.com/paper",
      }),
      updatePortfolioProfile(validProfile),
      updateSiteSettings({
        site_title: "Portfolio",
        default_description: "Description",
        is_published: true,
      }),
      saveRelatedProject({
        project_id: validId,
        related_project_id: "d8c61cbd-88c2-42b3-b4e8-34a52fdcfb8c",
      }),
      deleteRelatedProject(
        validId,
        "d8c61cbd-88c2-42b3-b4e8-34a52fdcfb8c",
      ),
      updateContentOrder("projects", validId, { display_order: 2 }),
      moveAdminContent("projects", validId, "up"),
      updateContentOrder("research_publications", validId, {
        display_order: 2,
      }),
      moveAdminContent("research_publications", validId, "up"),
      deleteAdminContent("research_publications", validId),
      updateMediaAsset(validId, {
        storage_bucket: "portfolio-media",
        storage_path: "images/photo.webp",
        media_type: "image/webp",
        alt_text: null,
        is_published: false,
      }),
      saveResumeAsset(null, {
        storage_bucket: "resume-documents",
        storage_path: "resume/masum.pdf",
        file_name: "masum.pdf",
        display_order: 0,
        is_published: false,
      }),
      deleteAdminAsset("media_assets", validId),
      updateContactMessageStatus(validId, "read"),
      deleteContactMessage(validId),
    ];

    const results = await Promise.allSettled(mutations);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(clientFactory).not.toHaveBeenCalled();
  });
});
