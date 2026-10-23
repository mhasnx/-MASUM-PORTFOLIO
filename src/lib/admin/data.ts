import "server-only";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  adminIdSchema,
  certificationSchema,
  contentOrderSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectCategorySchema,
  projectSchema,
  relatedProjectSchema,
  resumeMetadataSchema,
  serviceSchema,
  skillCategorySchema,
  siteSettingsSchema,
  skillSchema,
  uploadMetadataSchema,
} from "@/lib/validation";
import { z } from "zod";

type ProjectInput = z.output<typeof projectSchema>;
type ProjectCategoryInput = z.output<typeof projectCategorySchema>;
type SkillInput = z.output<typeof skillSchema>;
type ServiceInput = z.output<typeof serviceSchema>;
type ProfileInput = z.output<typeof profileSchema>;
type SiteSettingsInput = z.output<typeof siteSettingsSchema>;
type SkillCategoryInput = z.output<typeof skillCategorySchema>;
type ExperienceInput = z.output<typeof experienceSchema>;
type EducationInput = z.output<typeof educationSchema>;
type CertificationInput = z.output<typeof certificationSchema>;
type ResumeMetadataInput = z.output<typeof resumeMetadataSchema>;
type RelatedProjectInput = z.output<typeof relatedProjectSchema>;

function reportDatabaseError(
  operation: string,
  error: { message: string; code?: string },
) {
  console.error(`Administrator data operation failed: ${operation}.`, error);
  if (error.code === "23505") {
    throw new Error("That slug or name is already in use.");
  }
  throw new Error("The requested portfolio update could not be completed.");
}

function refreshPortfolio() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}

async function getAuthorizedClient() {
  await requireAdmin();
  return createSupabaseServerClient();
}

async function validateProjectCategory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  categoryId: string | null | undefined,
): Promise<string | null> {
  if (!categoryId) {
    return null;
  }

  const { data, error } = await supabase
    .from("project_categories")
    .select("id, name")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    reportDatabaseError("validate project category", error);
  }
  if (!data) {
    throw new Error("Choose an existing project category.");
  }
  return data.name;
}

async function validateSkillCategory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  categoryId: string | null,
) {
  if (!categoryId) {
    return;
  }

  const { data, error } = await supabase
    .from("skill_categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    reportDatabaseError("validate skill category", error);
  }
  if (!data) {
    throw new Error("Choose an existing skill category.");
  }
}

export async function listAdminProjects() {
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });

  if (error) {
    reportDatabaseError("list projects", error);
  }

  return data;
}

export async function listAdminContent(table: unknown) {
  const contentTable = z
    .enum([
      "project_categories",
      "skill_categories",
      "projects",
      "skills",
      "services",
      "experiences",
      "education",
      "certifications",
      "research_publications",
      "project_related",
      "media_assets",
      "resume_assets",
    ])
    .parse(table);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from(contentTable)
    .select("*")
    .order("display_order");

  if (error) {
    reportDatabaseError(`list ${contentTable}`, error);
  }
  return data;
}

export async function listAdminSingleton(table: unknown) {
  const singletonTable = z.enum(["profiles", "site_settings"]).parse(table);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from(singletonTable)
    .select("*")
    .limit(1);

  if (error) {
    reportDatabaseError(`read ${singletonTable}`, error);
  }
  return data;
}

export async function createProject(input: unknown) {
  const project: ProjectInput = projectSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const categoryName = await validateProjectCategory(
    supabase,
    project.category_id,
  );
  if (project.category && project.category !== categoryName) {
    throw new Error("The project category does not match the selected category.");
  }
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...project, category: categoryName })
    .select("id, slug")
    .single();

  if (error) {
    reportDatabaseError("create project", error);
  }
  refreshPortfolio();
  return data;
}

export async function updateProject(id: unknown, input: unknown) {
  const projectId = adminIdSchema.parse(id);
  const project: ProjectInput = projectSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const categoryName = await validateProjectCategory(
    supabase,
    project.category_id,
  );
  if (project.category && project.category !== categoryName) {
    throw new Error("The project category does not match the selected category.");
  }
  const { data, error } = await supabase
    .from("projects")
    .update({ ...project, category: categoryName })
    .eq("id", projectId)
    .select("id, slug")
    .single();

  if (error) {
    reportDatabaseError("update project", error);
  }
  refreshPortfolio();
  return data;
}

export async function deleteProject(id: unknown) {
  const projectId = adminIdSchema.parse(id);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .select("id")
    .single();

  if (error) {
    reportDatabaseError("delete project", error);
  }
  refreshPortfolio();
  return data;
}

export async function saveProjectCategory(
  id: unknown | null,
  input: unknown,
) {
  const category: ProjectCategoryInput = projectCategorySchema.parse(input);
  const supabase = await getAuthorizedClient();
  const categoryId = id === null ? null : adminIdSchema.parse(id);
  const result = categoryId
    ? await supabase
        .from("project_categories")
        .update(category)
        .eq("id", categoryId)
        .select("id, slug")
        .single()
    : await supabase
        .from("project_categories")
        .insert(category)
        .select("id, slug")
        .single();

  if (result.error) {
    reportDatabaseError(
      categoryId ? "update project category" : "create project category",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function saveRelatedProject(input: unknown) {
  const relationship: RelatedProjectInput =
    relatedProjectSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const { data: projects, error: lookupError } = await supabase
    .from("projects")
    .select("id")
    .in("id", [relationship.project_id, relationship.related_project_id]);

  if (lookupError) {
    reportDatabaseError("validate related projects", lookupError);
  }
  if ((projects?.length ?? 0) !== 2) {
    throw new Error("Both projects must exist before linking them.");
  }

  const { data, error } = await supabase
    .from("project_related")
    .upsert(relationship, { onConflict: "project_id,related_project_id" })
    .select("project_id, related_project_id")
    .single();

  if (error) {
    reportDatabaseError("save related project", error);
  }
  refreshPortfolio();
  return data;
}

export async function deleteRelatedProject(
  projectId: unknown,
  relatedProjectId: unknown,
) {
  const project = adminIdSchema.parse(projectId);
  const related = adminIdSchema.parse(relatedProjectId);
  if (project === related) {
    throw new Error("A project cannot be related to itself.");
  }

  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("project_related")
    .delete()
    .eq("project_id", project)
    .eq("related_project_id", related)
    .select("project_id, related_project_id")
    .single();

  if (error) {
    reportDatabaseError("delete related project", error);
  }
  refreshPortfolio();
  return data;
}

export async function saveSkillCategory(id: unknown | null, input: unknown) {
  const category: SkillCategoryInput = skillCategorySchema.parse(input);
  const supabase = await getAuthorizedClient();
  const categoryId = id === null ? null : adminIdSchema.parse(id);
  const result = categoryId
    ? await supabase
        .from("skill_categories")
        .update(category)
        .eq("id", categoryId)
        .select("id, slug")
        .single()
    : await supabase
        .from("skill_categories")
        .insert(category)
        .select("id, slug")
        .single();

  if (result.error) {
    reportDatabaseError(
      categoryId ? "update skill category" : "create skill category",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function saveSkill(id: unknown | null, input: unknown) {
  const skill: SkillInput = skillSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const skillId = id === null ? null : adminIdSchema.parse(id);
  await validateSkillCategory(supabase, skill.category_id);
  const result = skillId
    ? await supabase
        .from("skills")
        .update(skill)
        .eq("id", skillId)
        .select("id")
        .single()
    : await supabase.from("skills").insert(skill).select("id").single();

  if (result.error) {
    reportDatabaseError(skillId ? "update skill" : "create skill", result.error);
  }
  refreshPortfolio();
  return result.data;
}

export async function saveService(id: unknown | null, input: unknown) {
  const service: ServiceInput = serviceSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const serviceId = id === null ? null : adminIdSchema.parse(id);
  const result = serviceId
    ? await supabase
        .from("services")
        .update(service)
        .eq("id", serviceId)
        .select("id, slug")
        .single()
    : await supabase
        .from("services")
        .insert(service)
        .select("id, slug")
        .single();

  if (result.error) {
    reportDatabaseError(
      serviceId ? "update service" : "create service",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function updatePortfolioProfile(input: unknown) {
  const profile: ProfileInput = profileSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { ...profile, slug: "mahmudul-hassan-masum" },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (error) {
    reportDatabaseError("update profile", error);
  }
  refreshPortfolio();
  return data;
}

export async function updateSiteSettings(input: unknown) {
  const settings: SiteSettingsInput = siteSettingsSchema.parse(input);
  const supabase = await getAuthorizedClient();
  if (settings.resume_asset_id) {
    const { data: resume, error: resumeError } = await supabase
      .from("resume_assets")
      .select("id")
      .eq("id", settings.resume_asset_id)
      .eq("is_published", true)
      .maybeSingle();

    if (resumeError) {
      reportDatabaseError("validate resume reference", resumeError);
    }
    if (!resume) {
      throw new Error("Choose an existing published resume asset.");
    }
  }
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ ...settings, id: 1 }, { onConflict: "id" })
    .select("id")
    .single();

  if (error) {
    reportDatabaseError("update site settings", error);
  }
  refreshPortfolio();
  return data;
}

export async function saveExperience(id: unknown | null, input: unknown) {
  const experience: ExperienceInput = experienceSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const experienceId = id === null ? null : adminIdSchema.parse(id);
  const result = experienceId
    ? await supabase
        .from("experiences")
        .update(experience)
        .eq("id", experienceId)
        .select("id")
        .single()
    : await supabase
        .from("experiences")
        .insert(experience)
        .select("id")
        .single();

  if (result.error) {
    reportDatabaseError(
      experienceId ? "update experience" : "create experience",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function saveEducation(id: unknown | null, input: unknown) {
  const education: EducationInput = educationSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const educationId = id === null ? null : adminIdSchema.parse(id);
  const result = educationId
    ? await supabase
        .from("education")
        .update(education)
        .eq("id", educationId)
        .select("id")
        .single()
    : await supabase
        .from("education")
        .insert(education)
        .select("id")
        .single();

  if (result.error) {
    reportDatabaseError(
      educationId ? "update education" : "create education",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function saveCertification(id: unknown | null, input: unknown) {
  const certification: CertificationInput = certificationSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const certificationId = id === null ? null : adminIdSchema.parse(id);
  const result = certificationId
    ? await supabase
        .from("certifications")
        .update(certification)
        .eq("id", certificationId)
        .select("id")
        .single()
    : await supabase
        .from("certifications")
        .insert(certification)
        .select("id")
        .single();

  if (result.error) {
    reportDatabaseError(
      certificationId ? "update certification" : "create certification",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function updateMediaAsset(id: unknown, input: unknown) {
  const assetId = adminIdSchema.parse(id);
  const asset = uploadMetadataSchema.parse(input);
  if (
    asset.storage_bucket !== "portfolio-media" ||
    asset.media_type === "application/pdf"
  ) {
    throw new Error("Portfolio media metadata must describe an image asset.");
  }
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update(asset)
    .eq("id", assetId)
    .select("id")
    .single();

  if (error) {
    reportDatabaseError("update media metadata", error);
  }
  refreshPortfolio();
  return data;
}

export async function deleteAdminAsset(
  kind: "media_assets" | "resume_assets",
  id: unknown,
) {
  const assetId = adminIdSchema.parse(id);
  const assetKind = z.enum(["media_assets", "resume_assets"]).parse(kind);
  const supabase = await getAuthorizedClient();
  const assetResult =
    assetKind === "media_assets"
      ? await supabase
          .from("media_assets")
          .select("storage_bucket, storage_path")
          .eq("id", assetId)
          .single()
      : await supabase
          .from("resume_assets")
          .select("storage_bucket, storage_path")
          .eq("id", assetId)
          .single();

  if (assetResult.error) {
    reportDatabaseError("read asset before deletion", assetResult.error);
  }
  if (!assetResult.data) {
    throw new Error("The requested asset does not exist.");
  }

  const deleteResult =
    assetKind === "media_assets"
      ? await supabase
          .from("media_assets")
          .delete()
          .eq("id", assetId)
          .select("id")
          .single()
      : await supabase
          .from("resume_assets")
          .delete()
          .eq("id", assetId)
          .select("id")
          .single();

  if (deleteResult.error) {
    reportDatabaseError("delete asset metadata", deleteResult.error);
  }

  const { error: storageError } = await supabase.storage
    .from(assetResult.data.storage_bucket)
    .remove([assetResult.data.storage_path]);
  if (storageError) {
    console.error("Unable to remove a deleted asset from storage.", storageError);
    throw new Error(
      "Asset metadata was deleted, but its private storage object needs cleanup.",
    );
  }

  refreshPortfolio();
  return deleteResult.data;
}

export async function saveResumeAsset(
  id: unknown | null,
  input: unknown,
) {
  const asset: ResumeMetadataInput = resumeMetadataSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const assetId = id === null ? null : adminIdSchema.parse(id);
  const result = assetId
    ? await supabase
        .from("resume_assets")
        .update(asset)
        .eq("id", assetId)
        .select("id")
        .single()
    : await supabase.from("resume_assets").insert(asset).select("id").single();

  if (result.error) {
    reportDatabaseError(
      assetId ? "update resume metadata" : "create resume metadata",
      result.error,
    );
  }
  refreshPortfolio();
  return result.data;
}

export async function listAdminContactMessages(input: unknown = 50) {
  const limit = z.number().int().min(1).max(100).parse(input);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    reportDatabaseError("list contact messages", error);
  }
  return data;
}

export async function updateContactMessageStatus(
  id: unknown,
  status: unknown,
) {
  const messageId = adminIdSchema.parse(id);
  const parsedStatus = z.enum(["received", "read", "archived"]).parse(status);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status: parsedStatus })
    .eq("id", messageId)
    .select("id, status")
    .single();

  if (error) {
    reportDatabaseError("update contact message", error);
  }
  return data;
}

export async function deleteContactMessage(id: unknown) {
  const messageId = adminIdSchema.parse(id);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", messageId)
    .select("id")
    .single();

  if (error) {
    reportDatabaseError("delete contact message", error);
  }
  return data;
}

export async function getAdminOverview() {
  const user = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [
    projects,
    publishedProjects,
    featuredProjects,
    skills,
    activeServices,
    unreadMessages,
    messages,
    recentProjects,
    profile,
    settings,
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("featured", true),
    supabase.from("skills").select("id", { count: "exact", head: true }),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("is_available", true),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "received"),
    supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, status, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("projects")
      .select("id, title, slug, status, featured, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("name, email, is_published")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("site_settings")
      .select("site_title, default_description, is_published")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const errors = [
    ["count projects", projects.error],
    ["count published projects", publishedProjects.error],
    ["count featured projects", featuredProjects.error],
    ["count skills", skills.error],
    ["count active services", activeServices.error],
    ["count unread messages", unreadMessages.error],
    ["list recent messages", messages.error],
    ["list recently updated projects", recentProjects.error],
    ["read profile configuration", profile.error],
    ["read site configuration", settings.error],
  ] as const;

  for (const [operation, error] of errors) {
    if (error) {
      reportDatabaseError(operation, error);
    }
  }

  const missingConfiguration = [
    !profile.data?.name ? "Portfolio profile name" : null,
    !profile.data?.email ? "Contact email" : null,
    !profile.data?.is_published ? "Published profile" : null,
    !settings.data?.site_title ? "Website title" : null,
    !settings.data?.default_description ? "Website description" : null,
    !settings.data?.is_published ? "Published site settings" : null,
  ].filter((item): item is string => item !== null);

  return {
    email: user.email ?? "administrator",
    projectCount: projects.count ?? 0,
    publishedProjectCount: publishedProjects.count ?? 0,
    featuredProjectCount: featuredProjects.count ?? 0,
    skillCount: skills.count ?? 0,
    activeServiceCount: activeServices.count ?? 0,
    unreadMessageCount: unreadMessages.count ?? 0,
    messageCount: messages.count ?? 0,
    recentMessages: messages.data ?? [],
    recentProjects: recentProjects.data ?? [],
    missingConfiguration,
  };
}

export async function getAdminCmsData() {
  const supabase = await getAuthorizedClient();
  const [
    projects,
    projectCategories,
    skills,
    skillCategories,
    services,
    experiences,
    education,
    certifications,
    researchPublications,
    projectRelated,
    profiles,
    siteSettings,
    messages,
    mediaAssets,
    resumeAssets,
  ] = await Promise.all([
    supabase.from("projects").select("*").order("display_order"),
    supabase.from("project_categories").select("*").order("display_order"),
    supabase.from("skills").select("*").order("display_order"),
    supabase.from("skill_categories").select("*").order("display_order"),
    supabase.from("services").select("*").order("display_order"),
    supabase.from("experiences").select("*").order("display_order"),
    supabase.from("education").select("*").order("display_order"),
    supabase.from("certifications").select("*").order("display_order"),
    supabase
      .from("research_publications")
      .select("*")
      .order("display_order"),
    supabase.from("project_related").select("*").order("display_order"),
    supabase.from("profiles").select("*").limit(1),
    supabase.from("site_settings").select("*").eq("id", 1).limit(1),
    supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
    supabase.from("resume_assets").select("*").order("display_order"),
  ]);

  const errors = [
    ["list projects", projects.error],
    ["list project categories", projectCategories.error],
    ["list skills", skills.error],
    ["list skill categories", skillCategories.error],
    ["list services", services.error],
    ["list experience", experiences.error],
    ["list education", education.error],
    ["list certifications", certifications.error],
    ["list research publications", researchPublications.error],
    ["list related projects", projectRelated.error],
    ["read profile", profiles.error],
    ["read site settings", siteSettings.error],
    ["list contact messages", messages.error],
    ["list media assets", mediaAssets.error],
    ["list resume assets", resumeAssets.error],
  ] as const;

  for (const [operation, error] of errors) {
    if (error) {
      reportDatabaseError(operation, error);
    }
  }

  return {
    projects: projects.data ?? [],
    projectCategories: projectCategories.data ?? [],
    skills: skills.data ?? [],
    skillCategories: skillCategories.data ?? [],
    services: services.data ?? [],
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    certifications: certifications.data ?? [],
    researchPublications: researchPublications.data ?? [],
    projectRelated: projectRelated.data ?? [],
    profile: profiles.data?.[0] ?? null,
    siteSettings: siteSettings.data?.[0] ?? null,
    messages: messages.data ?? [],
    mediaAssets: mediaAssets.data ?? [],
    resumeAssets: resumeAssets.data ?? [],
  };
}

export async function updateContentOrder(
  table: unknown,
  id: unknown,
  input: unknown,
) {
  const editableTable = z
    .enum([
      "projects",
      "skills",
      "services",
      "experiences",
      "education",
      "certifications",
      "research_publications",
    ])
    .parse(table);
  const recordId = adminIdSchema.parse(id);
  const { display_order } = contentOrderSchema.parse(input);
  const supabase = await getAuthorizedClient();
  const result = await supabase
    .from(editableTable)
    .update({ display_order })
    .eq("id", recordId)
    .select("id")
    .single();

  if (result.error) {
    reportDatabaseError("update content order", result.error);
  }
  refreshPortfolio();
  return result.data;
}

export async function moveAdminContent(
  table: unknown,
  id: unknown,
  direction: unknown,
) {
  const editableTable = z
    .enum([
      "projects",
      "skills",
      "services",
      "experiences",
      "education",
      "certifications",
      "research_publications",
    ])
    .parse(table);
  const recordId = adminIdSchema.parse(id);
  const movement = z.enum(["up", "down"]).parse(direction);
  const supabase = await getAuthorizedClient();
  const { data, error } = await supabase
    .from(editableTable)
    .select("id, display_order")
    .order("display_order")
    .order("created_at");

  if (error) {
    reportDatabaseError(`read ${editableTable} order`, error);
  }

  const ordered = [...(data ?? [])];
  const currentIndex = ordered.findIndex((record) => record.id === recordId);
  if (currentIndex < 0) {
    throw new Error("The requested content record does not exist.");
  }
  const neighborIndex = currentIndex + (movement === "up" ? -1 : 1);
  const neighbor = ordered[neighborIndex];
  if (!neighbor) {
    return { moved: false };
  }

  const current = ordered[currentIndex];
  const currentOrder = current.display_order;
  const neighborOrder = neighbor.display_order;
  if (currentOrder === neighborOrder) {
    [ordered[currentIndex], ordered[neighborIndex]] = [
      ordered[neighborIndex],
      ordered[currentIndex],
    ];
    const results = await Promise.all(
      ordered.map((record, index) =>
        supabase
          .from(editableTable)
          .update({ display_order: index })
          .eq("id", record.id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      reportDatabaseError(`reorder ${editableTable}`, failed.error);
    }
  } else {
    const results = await Promise.all([
      supabase
        .from(editableTable)
        .update({ display_order: neighborOrder })
        .eq("id", current.id),
      supabase
        .from(editableTable)
        .update({ display_order: currentOrder })
        .eq("id", neighbor.id),
    ]);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      reportDatabaseError(`reorder ${editableTable}`, failed.error);
    }
  }

  refreshPortfolio();
  return { moved: true };
}

export async function deleteAdminContent(
  table: unknown,
  id: unknown,
) {
  const deletableTable = z
    .enum([
      "projects",
      "project_categories",
      "skill_categories",
      "skills",
      "services",
      "experiences",
      "education",
      "certifications",
      "research_publications",
    ])
    .parse(table);
  const recordId = adminIdSchema.parse(id);
  const supabase = await getAuthorizedClient();
  const result = await supabase
    .from(deletableTable)
    .delete()
    .eq("id", recordId)
    .select("id")
    .single();

  if (result.error) {
    reportDatabaseError(`delete ${deletableTable} record`, result.error);
  }
  refreshPortfolio();
  return result.data;
}
