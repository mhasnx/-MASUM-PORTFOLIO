import "server-only";

import { cache } from "react";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPublishedAssetUrl } from "@/lib/storage";
import {
  parsePortfolioImageReference,
  resolvePortfolioImageReference,
} from "@/lib/portfolio/media-reference";
import { temporaryPortfolioFixtures } from "./fixtures";
import { mapEditorialContent } from "./map-editorial-content";
import { supplementalPortfolioContent } from "./supplemental-content";
import type {
  PortfolioContent,
  PortfolioProject,
  ProjectResult,
  ProjectScreenshot,
  SocialLink,
} from "./types";

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function toSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is SocialLink =>
      typeof entry === "object" &&
      entry !== null &&
      "label" in entry &&
      typeof entry.label === "string" &&
      "url" in entry &&
      typeof entry.url === "string",
  );
}

function toProjectResults(value: unknown): ProjectResult[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is ProjectResult =>
      typeof entry === "object" &&
      entry !== null &&
      "label" in entry &&
      typeof entry.label === "string" &&
      "value" in entry &&
      typeof entry.value === "string" &&
      "verified" in entry &&
      entry.verified === true,
  );
}

function toScreenshots(value: unknown): ProjectScreenshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is ProjectScreenshot =>
      typeof entry === "object" &&
      entry !== null &&
      "url" in entry &&
      typeof entry.url === "string" &&
      "alt" in entry &&
      typeof entry.alt === "string",
  );
}

function getTemporaryContent(): PortfolioContent {
  return structuredClone(temporaryPortfolioFixtures);
}

async function getPublishedPortfolioContent(): Promise<PortfolioContent> {
  const config = getSupabasePublicConfig();

  if (!config) {
    return getTemporaryContent();
  }

  const supabase = await createSupabaseServerClient();
  const [
    profileResult,
    educationResult,
    categoriesResult,
    skillsResult,
    servicesResult,
    projectsResult,
    experienceResult,
    certificationsResult,
    publicationsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "name, professional_title, headline, subtitle, introduction, biography, professional_interests, working_approach, social_links, availability_label, is_available, primary_cta_text, primary_cta_href, secondary_cta_text, secondary_cta_href, email, phone, location, avatar_url, avatar_alt, courses, achievements",
      )
      .eq("slug", "mahmudul-hassan-masum")
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("education")
      .select(
        "institution, qualification, field_of_study, description, start_date, end_date",
      )
      .eq("is_published", true)
      .order("display_order"),
    supabase
      .from("skill_categories")
      .select("id, name, display_order")
      .order("display_order"),
    supabase
      .from("skills")
      .select("name, category_id, display_order")
      .eq("is_published", true)
      .order("display_order"),
    supabase
      .from("services")
      .select(
        "title, slug, description, deliverables, price_amount, price_currency, availability",
      )
      .eq("is_published", true)
      .eq("is_available", true)
      .order("display_order"),
    supabase
      .from("projects")
      .select(
        "id, title, slug, summary, description, category, featured, thumbnail_url, thumbnail_alt, problem, approach, solution, tools, verified_results, screenshots, external_url, source_url, seo_title, seo_description",
      )
      .eq("status", "published")
      .order("display_order"),
    supabase
      .from("experiences")
      .select(
        "role, organization, kind, description, period_label, start_date, end_date, is_current, is_published",
      )
      .eq("is_published", true)
      .in("kind", [
        "work",
        "freelance",
        "teaching",
        "leadership",
        "community",
      ])
      .order("display_order"),
    supabase
      .from("certifications")
      .select("name, issuer, kind, credential_url, issued_on")
      .eq("is_published", true)
      .order("display_order"),
    supabase
      .from("research_publications")
      .select(
        "title, description, authors, author_contribution, venue, publication_year, doi, source_url, display_order, is_published",
      )
      .eq("is_published", true)
      .order("display_order"),
    supabase
      .from("site_settings")
      .select("site_title, default_description, website_url, logo_url, favicon_url, footer_text, theme_default, resume_asset_id")
      .eq("id", 1)
      .eq("is_published", true)
      .maybeSingle(),
  ]);

  const errors = [
    profileResult.error,
    educationResult.error,
    categoriesResult.error,
    skillsResult.error,
    servicesResult.error,
    projectsResult.error,
    experienceResult.error,
    certificationsResult.error,
    publicationsResult.error,
    settingsResult.error,
  ].filter((error) => error !== null);

  if (errors.length > 0) {
    throw new Error(
      `Unable to load published portfolio content: ${errors.map((error) => error.message).join("; ")}`,
    );
  }

  const profile = profileResult.data;
  const settings = settingsResult.data;
  const resumeQuery = settings?.resume_asset_id
    ? await supabase
        .from("resume_assets")
        .select("storage_path")
        .eq("id", settings.resume_asset_id)
        .eq("is_published", true)
        .maybeSingle()
    : await supabase
        .from("resume_assets")
        .select("storage_path")
        .eq("is_published", true)
        .order("display_order")
        .limit(1)
        .maybeSingle();

  if (resumeQuery.error) {
    throw new Error(
      `Unable to load the published resume: ${resumeQuery.error.message}`,
    );
  }

  const skillRows = skillsResult.data ?? [];
  const skillCategories = (categoriesResult.data ?? [])
    .map((category) => ({
      name: category.name,
      skills: skillRows
        .filter((skill) => skill.category_id === category.id)
        .map((skill) => skill.name),
    }))
    .filter((category) => category.skills.length > 0);

  const projectRows = projectsResult.data ?? [];
  const referencedAssetIds = [
    ...new Set(
      projectRows
        .map((project) => parsePortfolioImageReference(project.thumbnail_url))
        .filter((id): id is string => id !== null),
    ),
  ];
  const publishedAssetsResult = referencedAssetIds.length
    ? await supabase
        .from("media_assets")
        .select("id, storage_path")
        .in("id", referencedAssetIds)
        .eq("is_published", true)
    : { data: [], error: null };

  if (publishedAssetsResult.error) {
    throw new Error("Unable to load published project images.");
  }

  const publishedAssets = new Map(
    (publishedAssetsResult.data ?? []).map((asset) => [
      asset.id,
      asset.storage_path,
    ]),
  );
  const projects: PortfolioProject[] = await Promise.all(
    projectRows.map(async (project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      category: project.category,
      featured: project.featured,
      thumbnailUrl: await resolvePortfolioImageReference(
        project.thumbnail_url,
        publishedAssets,
        (storagePath) =>
          createPublishedAssetUrl("portfolio-media", storagePath),
      ),
      thumbnailAlt: project.thumbnail_alt,
      problem: project.problem,
      approach: project.approach,
      solution: project.solution,
      tools: project.tools ?? [],
      verifiedResults: toProjectResults(project.verified_results),
      screenshots: toScreenshots(project.screenshots),
      liveUrl: project.external_url,
      sourceUrl: project.source_url,
      seoTitle: project.seo_title,
      seoDescription: project.seo_description,
      relatedProjects: [],
    })),
  );
  const editorialContent = mapEditorialContent(
    publicationsResult.data ?? [],
    experienceResult.data ?? [],
  );

  let resumeUrl: string | null = null;

  if (resumeQuery.data) {
    const { data, error } = await supabase.storage
      .from("resume-documents")
      .createSignedUrl(resumeQuery.data.storage_path, 300);

    if (error) {
      throw new Error(`Unable to load the published resume: ${error.message}`);
    }

    resumeUrl = data.signedUrl;
  }

  return {
    siteTitle: settings?.site_title ?? temporaryPortfolioFixtures.siteTitle,
    siteDescription:
      settings?.default_description ?? temporaryPortfolioFixtures.siteDescription,
    siteUrl:
      settings?.website_url ?? process.env.NEXT_PUBLIC_SITE_URL ?? null,
    logoUrl: settings?.logo_url ?? null,
    faviconUrl: settings?.favicon_url ?? null,
    footerText: settings?.footer_text ?? null,
    themeDefault: settings?.theme_default ?? "system",
    profile: profile
      ? {
          name: profile.name,
          professionalTitle: profile.professional_title,
          headline: profile.headline ?? "",
          subtitle: profile.subtitle ?? "",
          introduction: profile.introduction ?? "",
          biography: profile.biography,
          professionalInterests: toStringList(
            profile.professional_interests,
          ),
          workingApproach: toStringList(profile.working_approach),
          availabilityLabel: profile.availability_label,
          isAvailable: profile.is_available,
          primaryCtaText: profile.primary_cta_text,
          primaryCtaHref: profile.primary_cta_href,
          secondaryCtaText: profile.secondary_cta_text,
          secondaryCtaHref: profile.secondary_cta_href,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          avatarUrl: profile.avatar_url ?? "/Profile.png",
          avatarAlt:
            profile.avatar_alt ?? "Portrait of MD. Mahmudul Hassan",
          socialLinks: toSocialLinks(profile.social_links),
        }
      : {
          ...getTemporaryContent().profile,
          name: "",
          professionalTitle: null,
          headline: "",
          subtitle: "",
          introduction: "",
          biography: null,
          professionalInterests: [],
          workingApproach: [],
          availabilityLabel: null,
          isAvailable: false,
          primaryCtaText: null,
          primaryCtaHref: null,
          secondaryCtaText: null,
          secondaryCtaHref: null,
          email: null,
          phone: null,
          location: null,
          avatarUrl: null,
          avatarAlt: null,
          socialLinks: [],
        },
    education: (educationResult.data ?? []).map((item) => ({
      institution: item.institution,
      qualification: item.qualification,
      fieldOfStudy: item.field_of_study,
      description: item.description,
      startDate: item.start_date,
      endDate: item.end_date,
    })),
    skillCategories,
    services: (servicesResult.data ?? []).map((item) => ({
      title: item.title,
      slug: item.slug,
      description: item.description,
      deliverables: item.deliverables ?? [],
      priceAmount: item.price_amount,
      priceCurrency: item.price_currency,
      availability: item.availability,
    })),
    projects,
    experience: editorialContent.experience,
    certifications: (certificationsResult.data ?? [])
      .filter((item) => item.kind === "certification")
      .map((item) => ({
        name: item.name,
        issuer: item.issuer,
        credentialUrl: item.credential_url,
        issuedOn: item.issued_on,
      })),
    courses: [
      ...toStringList(profile?.courses),
      ...(certificationsResult.data ?? [])
        .filter((item) => item.kind === "course" || item.kind === "training")
        .map((item) => item.name),
    ],
    achievements: [
      ...toStringList(profile?.achievements),
      ...(certificationsResult.data ?? [])
        .filter((item) => item.kind === "achievement")
        .map((item) => item.name),
    ],
    supplemental: {
      ...supplementalPortfolioContent,
      ...editorialContent.supplemental,
    },
    resumeUrl,
  };
}

export const getPortfolioContent = cache(getPublishedPortfolioContent);

export const getPublishedProjects = cache(async () => {
  const content = await getPortfolioContent();
  return content.projects;
});

export async function getPublishedProject(slug: string) {
  const projects = await getPublishedProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return null;
  }

  const content = await getPortfolioContent();
  const supabase = getSupabasePublicConfig()
    ? await createSupabaseServerClient()
    : null;

  if (!supabase) {
    return project;
  }

  const { data: relatedRows, error } = await supabase
    .from("project_related")
    .select("related_project_id, display_order")
    .eq("project_id", project.id)
    .order("display_order");

  if (error) {
    throw new Error(`Unable to load related projects: ${error.message}`);
  }

  const relatedIds = new Set(
    (relatedRows ?? []).map((item) => item.related_project_id),
  );

  return {
    ...project,
    relatedProjects: content.projects
      .filter((item) => relatedIds.has(item.id))
      .map((item) => item.slug),
  };
}
