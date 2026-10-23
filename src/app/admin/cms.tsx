"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notification } from "@/components/ui/notification";
import type { AdminCmsData } from "@/lib/admin/types";
import {
  makePortfolioImageReference,
  parsePortfolioImageReference,
  PORTFOLIO_IMAGE_REFERENCE_PREFIX,
} from "@/lib/portfolio/media-reference";
import {
  createProjectAction,
  deleteContactMessageAction,
  deletePortfolioAssetAction,
  deletePortfolioContentAction,
  deleteRelatedProjectAction,
  getAdminOverviewAction,
  moveContentAction,
  saveCertificationAction,
  saveEducationAction,
  saveExperienceAction,
  saveProjectCategoryAction,
  saveResearchPublicationAction,
  saveRelatedProjectAction,
  saveResumeAssetAction,
  saveServiceAction,
  saveSkillAction,
  saveSkillCategoryAction,
  updateContactMessageStatusAction,
  updateMediaAssetAction,
  updateProfileAction,
  updateProjectAction,
  updateSiteSettingsAction,
  uploadPortfolioAssetAction,
} from "./actions";
import { signOutAction } from "./login/actions";

type CmsRecord = Record<string, unknown>;
type EditorSection =
  | "projects"
  | "project-categories"
  | "skills"
  | "skill-categories"
  | "services"
  | "experience"
  | "research"
  | "education"
  | "certifications"
  | "profile"
  | "settings"
  | "media-assets"
  | "resume-assets";
type FieldKind =
  | "text"
  | "url"
  | "textarea"
  | "lines"
  | "json"
  | "number"
  | "checkbox"
  | "select"
  | "multi-select"
  | "date";
type FieldDefinition = {
  name: string;
  label: string;
  kind: FieldKind;
  options?: { label: string; value: string }[];
  hint?: string;
};
type FormValue = string | boolean | string[];
type FormValues = Record<string, FormValue>;

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "skills", label: "Skills", icon: Check },
  { id: "services", label: "Services", icon: Archive },
  { id: "experience", label: "Experience", icon: UserRound },
  { id: "research", label: "Research", icon: FileText },
  { id: "education", label: "Education", icon: FileText },
  { id: "certifications", label: "Credentials", icon: Check },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Site settings", icon: Settings },
  { id: "categories", label: "Categories", icon: Archive },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "assets", label: "Media & resume", icon: FileText },
] as const;

function asRecords(rows: readonly object[]): CmsRecord[] {
  return rows.map((row) => Object.fromEntries(Object.entries(row)));
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: FormValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function asId(record: CmsRecord): string {
  return String(record.id ?? "");
}

function getVisibleRecords(
  section: string,
  data: AdminCmsData,
  categoryKind: "projects" | "skills",
): CmsRecord[] {
  switch (section) {
    case "projects":
      return asRecords(data.projects).map((project) => ({
        ...project,
        thumbnail_asset_id:
          parsePortfolioImageReference(asString(project.thumbnail_url)) ?? "",
        related_project_ids: data.projectRelated
          .filter((relation) => relation.project_id === project.id)
          .sort((first, second) => first.display_order - second.display_order)
          .map((relation) => relation.related_project_id),
      }));
    case "skills":
      return asRecords(data.skills).map((skill) => ({
        ...skill,
        category_name:
          data.skillCategories.find((category) => category.id === skill.category_id)
            ?.name ?? null,
      }));
    case "services":
      return asRecords(data.services);
    case "experience":
      return asRecords(data.experiences);
    case "research":
      return asRecords(data.researchPublications);
    case "education":
      return asRecords(data.education);
    case "certifications":
      return asRecords(data.certifications);
    case "categories":
      return categoryKind === "projects"
        ? asRecords(data.projectCategories)
        : asRecords(data.skillCategories);
    case "assets":
      return [...asRecords(data.mediaAssets), ...asRecords(data.resumeAssets)];
    default:
      return [];
  }
}

function fieldDefinitions(
  section: EditorSection,
  data: AdminCmsData,
  currentId?: string | null,
): FieldDefinition[] {
  const projectCategories = [
    { label: "Uncategorized", value: "" },
    ...data.projectCategories.map((item) => ({
      label: item.name,
      value: item.id,
    })),
  ];
  const skillCategories = [
    { label: "Uncategorized", value: "" },
    ...data.skillCategories.map((item) => ({
      label: item.name,
      value: item.id,
    })),
  ];
  const resumeOptions = [
    { label: "No resume selected", value: "" },
    ...data.resumeAssets.map((item) => ({
      label: `${item.file_name}${item.is_published ? " · published" : ""}`,
      value: item.id,
    })),
  ];
  const relatedProjectOptions = data.projects
    .filter((project) => project.id !== currentId)
    .map((project) => ({
      label: `${project.title} · ${project.slug}`,
      value: project.id,
    }));
  const mediaAssetOptions = [
    { label: "No uploaded image selected", value: "" },
    ...data.mediaAssets
      .filter(
        (asset) =>
          asset.storage_bucket === "portfolio-media" &&
          ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
            asset.media_type,
          ),
      )
      .map((asset) => ({
        label: `${asset.storage_path}${asset.is_published ? " · published" : " · private"}`,
        value: asset.id,
      })),
  ];
  const f = (
    name: string,
    label: string,
    kind: FieldKind = "text",
    options?: FieldDefinition["options"],
    hint?: string,
  ): FieldDefinition => ({ name, label, kind, options, hint });

  switch (section) {
    case "projects":
      return [
        f("title", "Project title"),
        f("slug", "URL slug"),
        f("summary", "Summary", "textarea"),
        f("description", "Overview", "textarea"),
        f("category_id", "Category", "select", projectCategories),
        f(
          "thumbnail_asset_id",
          "Uploaded thumbnail image",
          "select",
          mediaAssetOptions,
          "Select an uploaded image, or leave this blank to use an external thumbnail URL.",
        ),
        f("thumbnail_url", "External thumbnail URL", "url"),
        f(
          "thumbnail_alt",
          "Thumbnail alt text",
          "text",
          undefined,
          "Required when an uploaded image is selected.",
        ),
        f("problem", "Problem", "textarea"),
        f("approach", "Approach", "textarea"),
        f("solution", "Solution", "textarea"),
        f("tools", "Tools (one per line)", "lines"),
        f(
          "screenshots",
          "Gallery screenshots (JSON array of { url, alt })",
          "json",
        ),
        f(
          "verified_results",
          "Verified results (JSON array; each item must include verified: true)",
          "json",
        ),
        f(
          "related_project_ids",
          "Related projects",
          "multi-select",
          relatedProjectOptions,
        ),
        f("external_url", "Live demo URL", "url"),
        f("source_url", "Source repository URL", "url"),
        f(
          "seo_title",
          "SEO title",
          "text",
          undefined,
          "Optional; up to 70 characters. Leave blank to use the project title.",
        ),
        f(
          "seo_description",
          "SEO description",
          "textarea",
          undefined,
          "Optional; up to 320 characters. Leave blank to use the project summary.",
        ),
        f("status", "Publication", "select", [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
        ]),
        f("featured", "Featured project", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "project-categories":
      return [
        f("name", "Category name"),
        f("slug", "URL slug"),
        f("description", "Description", "textarea"),
        f("display_order", "Display order", "number"),
      ];
    case "skills":
      return [
        f("name", "Skill name"),
        f("category_id", "Category", "select", skillCategories),
        f("description", "Description", "textarea"),
        f("icon", "Icon identifier"),
        f("proficiency", "Optional proficiency (0–100)", "number"),
        f("display_order", "Display order", "number"),
        f("is_published", "Visible on the public site", "checkbox"),
      ];
    case "skill-categories":
      return [
        f("name", "Category name"),
        f("slug", "URL slug"),
        f("display_order", "Display order", "number"),
      ];
    case "services":
      return [
        f("title", "Service name"),
        f("slug", "URL slug"),
        f("description", "Description", "textarea"),
        f("deliverables", "Deliverables (one per line)", "lines"),
        f("icon", "Icon identifier"),
        f("price_amount", "Optional price", "number"),
        f("price_currency", "Currency (ISO 4217, e.g. USD)"),
        f("availability", "Availability note"),
        f("is_available", "Currently available", "checkbox"),
        f("is_published", "Published on the public site", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "experience":
      return [
        f("kind", "Entry type", "select", [
          { label: "Work", value: "work" },
          { label: "Freelance", value: "freelance" },
          { label: "Training", value: "training" },
          { label: "Course", value: "course" },
          { label: "Achievement", value: "achievement" },
          { label: "Teaching", value: "teaching" },
          { label: "Leadership", value: "leadership" },
          { label: "Community", value: "community" },
        ]),
        f("role", "Role or title"),
        f("organization", "Organization"),
        f("description", "Description", "textarea"),
        f(
          "period_label",
          "Flexible period label",
          "text",
          undefined,
          "Optional text such as 2023–Present. Existing start/end dates are retained separately.",
        ),
        f("start_date", "Start date", "date"),
        f("end_date", "End date", "date"),
        f("is_current", "Current position", "checkbox"),
        f("external_url", "Reference URL", "url"),
        f("skills", "Related skills (one per line)", "lines"),
        f("is_published", "Published", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "research":
      return [
        f("source_url", "Source URL", "url", undefined, "Use the HTTPS source page."),
        f("title", "Publication title", "text", undefined, "Leave blank if unverified."),
        f("description", "Description", "textarea"),
        f("authors", "Authors (one per line)", "lines", undefined, "Only enter verified author names and order."),
        f("author_contribution", "Author contribution", "textarea", undefined, "Leave blank unless your role is verified."),
        f("venue", "Journal or venue", "text", undefined, "Optional; enter only when verified."),
        f("publication_year", "Publication year", "number"),
        f("doi", "DOI", "text", undefined, "Optional; use the DOI identifier, for example 10.1234/example."),
        f("is_published", "Published on the public site", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "education":
      return [
        f("institution", "Institution"),
        f("qualification", "Qualification"),
        f("field_of_study", "Field of study"),
        f("description", "Description", "textarea"),
        f("start_date", "Start date", "date"),
        f("end_date", "End date", "date"),
        f("external_url", "Reference URL", "url"),
        f("skills", "Related skills (one per line)", "lines"),
        f("is_published", "Published", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "certifications":
      return [
        f("kind", "Credential type", "select", [
          { label: "Certification", value: "certification" },
          { label: "Training", value: "training" },
          { label: "Course", value: "course" },
          { label: "Achievement", value: "achievement" },
        ]),
        f("name", "Name"),
        f("issuer", "Issuer"),
        f("description", "Description", "textarea"),
        f("credential_url", "Credential URL", "url"),
        f("issued_on", "Issue date", "date"),
        f("expires_on", "Expiration date", "date"),
        f("skills", "Related skills (one per line)", "lines"),
        f("is_published", "Published", "checkbox"),
        f("display_order", "Display order", "number"),
      ];
    case "profile":
      return [
        f("name", "Name"),
        f("professional_title", "Professional title"),
        f("headline", "Headline", "textarea"),
        f("subtitle", "Professional subtitle", "textarea"),
        f("introduction", "Introduction", "textarea"),
        f("biography", "Biography", "textarea"),
        f("professional_interests", "Professional interests (one per line)", "lines"),
        f("working_approach", "Working approach (one per line)", "lines"),
        f("social_links", "Social profile links (JSON array)", "json"),
        f("avatar_url", "Profile image URL", "url"),
        f("avatar_alt", "Profile image alt text"),
        f("availability_label", "Availability label"),
        f("is_available", "Show as available", "checkbox"),
        f("primary_cta_text", "Primary CTA text"),
        f("primary_cta_href", "Primary CTA destination"),
        f("secondary_cta_text", "Secondary CTA text"),
        f("secondary_cta_href", "Secondary CTA destination"),
        f("email", "Contact email"),
        f("phone", "Contact phone"),
        f("location", "Location"),
        f("courses", "Courses (one per line)", "lines"),
        f("achievements", "Achievements (one per line)", "lines"),
        f("is_published", "Publish profile", "checkbox"),
      ];
    case "settings":
      return [
        f("site_title", "Website title"),
        f("default_description", "Website description", "textarea"),
        f("website_url", "Website URL", "url"),
        f("logo_url", "Logo URL", "url"),
        f("favicon_url", "Favicon URL", "url"),
        f("footer_text", "Footer content", "textarea"),
        f("theme_default", "Default theme", "select", [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "System preference", value: "system" },
        ]),
        f("resume_asset_id", "Published resume reference", "select", resumeOptions),
        f("analytics_enabled", "Enable configured analytics ID", "checkbox"),
        f("analytics_id", "Analytics ID (GA4, GTM, or Ads)"),
        f("is_published", "Publish site settings", "checkbox"),
      ];
    case "media-assets":
      return [
        f("storage_bucket", "Storage bucket"),
        f("storage_path", "Storage path"),
        f("media_type", "Media type"),
        f("alt_text", "Alt text"),
        f("is_published", "Publicly available", "checkbox"),
      ];
    case "resume-assets":
      return [
        f("storage_bucket", "Storage bucket"),
        f("storage_path", "Storage path"),
        f("file_name", "File name"),
        f("display_order", "Display order", "number"),
        f("is_published", "Published resume", "checkbox"),
      ];
  }
}

function newRecord(section: EditorSection): CmsRecord {
  const defaults: Partial<Record<EditorSection, CmsRecord>> = {
    projects: {
      category_id: null,
      description: null,
      category: null,
      problem: null,
      approach: null,
      solution: null,
      tools: [],
      verified_results: [],
      screenshots: [],
      thumbnail_url: null,
      thumbnail_alt: null,
      thumbnail_asset_id: "",
      seo_title: null,
      seo_description: null,
      external_url: null,
      source_url: null,
      featured: false,
      status: "draft",
      display_order: 0,
      related_project_ids: [],
    },
    "project-categories": { description: null, display_order: 0 },
    skills: {
      category_id: null,
      description: null,
      icon: null,
      proficiency: null,
      display_order: 0,
      is_published: false,
    },
    "skill-categories": { display_order: 0 },
    services: {
      deliverables: [],
      icon: null,
      price_amount: null,
      price_currency: null,
      availability: null,
      is_available: true,
      display_order: 0,
      is_published: false,
    },
    experience: {
      kind: "work",
      description: null,
      start_date: null,
      end_date: null,
      is_current: false,
      external_url: null,
      skills: [],
      display_order: 0,
      is_published: false,
    },
    research: {
      title: null,
      description: null,
      authors: [],
      author_contribution: null,
      venue: null,
      publication_year: null,
      doi: null,
      is_published: false,
      display_order: 0,
    },
    education: {
      field_of_study: null,
      description: null,
      start_date: null,
      end_date: null,
      external_url: null,
      skills: [],
      display_order: 0,
      is_published: false,
    },
    certifications: {
      kind: "certification",
      description: null,
      credential_url: null,
      issued_on: null,
      expires_on: null,
      skills: [],
      display_order: 0,
      is_published: false,
    },
    profile: {
      professional_title: null,
      headline: null,
      subtitle: null,
      introduction: null,
      biography: null,
      professional_interests: [],
      working_approach: [],
      social_links: [],
      availability_label: null,
      is_available: false,
      primary_cta_text: null,
      primary_cta_href: null,
      secondary_cta_text: null,
      secondary_cta_href: null,
      avatar_url: null,
      avatar_alt: null,
      courses: [],
      achievements: [],
      email: null,
      phone: null,
      location: null,
      is_published: false,
    },
    settings: {
      website_url: null,
      logo_url: null,
      favicon_url: null,
      footer_text: null,
      theme_default: "light",
      resume_asset_id: null,
      analytics_enabled: false,
      analytics_id: null,
      is_published: false,
    },
  };

  return defaults[section] ?? {};
}

function toFormValues(
  record: CmsRecord,
  definitions: FieldDefinition[],
): FormValues {
  return Object.fromEntries(
    definitions.map(({ name, kind }) => {
      const value =
        name === "thumbnail_url" &&
        typeof record.thumbnail_url === "string" &&
        record.thumbnail_url.startsWith(PORTFOLIO_IMAGE_REFERENCE_PREFIX)
          ? ""
          : record[name];
      if (kind === "checkbox") {
        return [name, value === true];
      }
      if (kind === "lines") {
        return [
          name,
          Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string").join("\n")
            : "",
        ];
      }
      if (kind === "json") {
        return [name, JSON.stringify(value ?? [], null, 2)];
      }
      if (kind === "multi-select") {
        return [
          name,
          Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string")
            : [],
        ];
      }
      return [
        name,
        value === null || value === undefined ? "" : String(value),
      ];
    }),
  );
}

function toPayload(
  section: EditorSection,
  values: FormValues,
  definitions: FieldDefinition[],
): CmsRecord {
  const payload: CmsRecord = {};
  for (const definition of definitions) {
    const value = values[definition.name];
    switch (definition.kind) {
      case "checkbox":
        payload[definition.name] = value === true;
        break;
      case "number":
        payload[definition.name] =
          typeof value === "string" && value.trim() !== ""
            ? Number(value)
            : null;
        break;
      case "lines":
        payload[definition.name] =
          typeof value === "string"
            ? value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
            : [];
        break;
      case "multi-select":
        payload[definition.name] = Array.isArray(value) ? value : [];
        break;
      case "json":
        try {
          payload[definition.name] =
            typeof value === "string" && value.trim()
              ? JSON.parse(value)
              : [];
        } catch {
          throw new Error(`${definition.label} must contain valid JSON.`);
        }
        break;
      case "url":
      case "text":
      case "textarea":
      case "date":
      case "select":
        payload[definition.name] =
          typeof value === "string" && value.trim() !== ""
            ? value.trim()
            : null;
        break;
    }
  }
  if (section === "projects") {
    payload.category = null;
  }
  return payload;
}

function displayValue(record: CmsRecord, key: string): string {
  const value = record[key];
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.length ? `${value.length} items` : "—";
  }
  return value === null || value === undefined || value === ""
    ? "—"
    : String(value);
}

export function AdminCms({
  overview,
  data,
}: {
  overview: Awaited<ReturnType<typeof getAdminOverviewAction>>;
  data: AdminCmsData;
}) {
  const router = useRouter();
  const [section, setSection] = useState<string>("dashboard");
  const [categoryKind, setCategoryKind] = useState<"projects" | "skills">(
    "projects",
  );
  const [assetKind, setAssetKind] = useState<"media-assets" | "resume-assets">(
    "media-assets",
  );
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editor, setEditor] = useState<{
    section: EditorSection;
    record: CmsRecord;
    id: string | null;
  } | null>(null);
  const [preview, setPreview] = useState<CmsRecord | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingRecordAction, setPendingRecordAction] = useState<string | null>(
    null,
  );
  const [uploadKind, setUploadKind] = useState<"image" | "resume">("image");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const rows = useMemo(
    () => getVisibleRecords(section, data, categoryKind),
    [section, data, categoryKind],
  );
  const filteredRows = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    return rows.filter((record) => {
      const searchable = Object.values(record)
        .map((value) => (typeof value === "string" ? value : ""))
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalized || searchable.includes(normalized);
      const categoryId = asString(record.category_id);
      const matchesCategory =
        section !== "projects" ||
        !categoryFilter ||
        categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [rows, filter, categoryFilter, section]);

  const editorDefinitions = editor
    ? fieldDefinitions(editor.section, data, editor.id)
    : [];

  function startEditor(
    editSection: EditorSection,
    record?: CmsRecord,
    duplicate = false,
  ) {
    const source = record ? { ...record } : newRecord(editSection);
    if (!record && "display_order" in source) {
      const existing = getVisibleRecords(
        editSection.endsWith("categories") ? "categories" : editSection,
        data,
        editSection === "project-categories" ? "projects" : "skills",
      );
      source.display_order =
        existing.reduce(
          (maximum, item) =>
            Math.max(maximum, Number(item.display_order ?? -1)),
          -1,
        ) + 1;
    }
    if (duplicate) {
      delete source.id;
      delete source.created_at;
      delete source.updated_at;
      source.status = "draft";
      source.is_published = false;
      source.featured = false;
      source.display_order = data.projects.length;
      if (typeof source.slug === "string") {
        const baseSlug = `${source.slug}-copy`;
        let candidate = baseSlug;
        let suffix = 2;
        while (data.projects.some((project) => project.slug === candidate)) {
          candidate = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        source.slug = candidate;
      }
      if (typeof source.title === "string") {
        source.title = `${source.title} copy`;
      }
    }
    if (editSection === "projects" && record && !duplicate) {
      source.related_project_ids = data.projectRelated
        .filter((relation) => relation.project_id === asId(record))
        .sort((first, second) => first.display_order - second.display_order)
        .map((relation) => relation.related_project_id);
    }
    setError("");
    setMessage("");
    setEditorError("");
    setEditor({
      section: editSection,
      record: source,
      id: record && !duplicate ? asId(record) : null,
    });
  }

  function closeEditor(dirty: boolean) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) {
      return;
    }
    setEditor(null);
  }

  async function saveEditor(values: FormValues) {
    if (!editor) return;
    setSaving(true);
    setError("");
    setEditorError("");
    try {
      const definitions = fieldDefinitions(
        editor.section,
        data,
        editor.id,
      );
      const payload = toPayload(
        editor.section,
        values,
        definitions,
      );
      switch (editor.section) {
        case "projects": {
          const selectedThumbnailAsset = payload.thumbnail_asset_id;
          delete payload.thumbnail_asset_id;
          if (
            typeof selectedThumbnailAsset === "string" &&
            selectedThumbnailAsset
          ) {
            payload.thumbnail_url = makePortfolioImageReference(
              selectedThumbnailAsset,
            );
          }
          const requestedRelatedIds = Array.isArray(payload.related_project_ids)
            ? payload.related_project_ids.filter(
                (value): value is string => typeof value === "string",
              )
            : [];
          delete payload.related_project_ids;
          let projectId = editor.id;
          if (editor.id) {
            const updated = await updateProjectAction(editor.id, payload);
            if (!updated) {
              throw new Error("The project update did not return a record.");
            }
            projectId = updated.id;
          } else {
            const created = await createProjectAction(payload);
            if (!created) {
              throw new Error("The project creation did not return a record.");
            }
            projectId = created.id;
          }
          if (!projectId) {
            throw new Error("The project was saved without an identifier.");
          }
          const existingRelatedIds = data.projectRelated
            .filter((relation) => relation.project_id === projectId)
            .map((relation) => relation.related_project_id);
          await Promise.all([
            ...existingRelatedIds
              .filter((relatedId) => !requestedRelatedIds.includes(relatedId))
              .map((relatedId) =>
                deleteRelatedProjectAction(projectId, relatedId),
              ),
            ...requestedRelatedIds.map((relatedId) =>
              saveRelatedProjectAction({
                project_id: projectId,
                related_project_id: relatedId,
                display_order: requestedRelatedIds.indexOf(relatedId),
              }),
            ),
          ]);
          break;
        }
        case "project-categories":
          await saveProjectCategoryAction(editor.id, payload);
          break;
        case "skills":
          await saveSkillAction(editor.id, payload);
          break;
        case "skill-categories":
          await saveSkillCategoryAction(editor.id, payload);
          break;
        case "services":
          await saveServiceAction(editor.id, payload);
          break;
        case "experience":
          await saveExperienceAction(editor.id, payload);
          break;
        case "research":
          await saveResearchPublicationAction(editor.id, payload);
          break;
        case "education":
          await saveEducationAction(editor.id, payload);
          break;
        case "certifications":
          await saveCertificationAction(editor.id, payload);
          break;
        case "profile":
          await updateProfileAction(payload);
          break;
        case "settings":
          await updateSiteSettingsAction(payload);
          break;
        case "media-assets":
          if (!editor.id) throw new Error("Media metadata is not editable.");
          await updateMediaAssetAction(editor.id, payload);
          break;
        case "resume-assets":
          await saveResumeAssetAction(editor.id, payload);
          break;
      }
      setEditor(null);
      setMessage("Changes saved to the portfolio database.");
      router.refresh();
    } catch (caught) {
      setEditorError(
        caught instanceof Error
          ? caught.message
          : "The changes could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(
    table:
      | "projects"
      | "project_categories"
      | "skill_categories"
      | "skills"
      | "services"
      | "experiences"
      | "education"
      | "certifications"
      | "research_publications",
    record: CmsRecord,
    description: string,
  ) {
    const actionKey = `${table}:${asId(record)}:delete`;
    if (pendingRecordAction) return;
    if (!window.confirm(`Delete “${description}”? This cannot be undone.`)) {
      return;
    }
    setError("");
    setMessage("");
    setPendingRecordAction(actionKey);
    try {
      await deletePortfolioContentAction(table, asId(record));
      setMessage("The record was deleted.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The record could not be deleted.",
      );
    } finally {
      setPendingRecordAction(null);
    }
  }

  async function toggleProject(
    record: CmsRecord,
    changes: { status?: "draft" | "published"; featured?: boolean },
  ) {
    const next: CmsRecord = { ...record, ...changes };
    delete next.id;
    delete next.created_at;
    delete next.updated_at;
    setError("");
    try {
      await updateProjectAction(asId(record), next);
      setMessage(
        changes.status
          ? `Project ${changes.status === "published" ? "published" : "unpublished"}.`
          : `Featured setting ${changes.featured ? "enabled" : "disabled"}.`,
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The project could not be updated.",
      );
    }
  }

  async function reorder(
    type:
      | "projects"
      | "skills"
      | "services"
      | "experiences"
      | "education"
      | "certifications"
      | "research_publications",
    record: CmsRecord,
    offset: -1 | 1,
  ) {
    const actionKey = `${type}:${asId(record)}:order`;
    if (pendingRecordAction) return;
    setPendingRecordAction(actionKey);
    setError("");
    setMessage("");
    try {
      const result = await moveContentAction(
        type,
        asId(record),
        offset === -1 ? "up" : "down",
      );
      setMessage(
        result.moved
          ? "Display order updated."
          : `This record is already at the ${
              offset === -1 ? "start" : "end"
            } of the list.`,
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The display order could not be updated.",
      );
    } finally {
      setPendingRecordAction(null);
    }
  }

  async function updateMessageStatus(record: CmsRecord, status: string) {
    try {
      await updateContactMessageStatusAction(asId(record), status);
      setMessage(`Message marked ${status}.`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The message status could not be updated.",
      );
    }
  }

  async function removeMessage(record: CmsRecord) {
    if (!window.confirm("Permanently delete this contact message?")) return;
    try {
      await deleteContactMessageAction(asId(record));
      setMessage("The message was deleted.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The message could not be deleted.",
      );
    }
  }

  async function removeAsset(
    kind: "media_assets" | "resume_assets",
    record: CmsRecord,
  ) {
    if (
      !window.confirm(
        `Delete ${String(record.file_name ?? record.storage_path ?? "this asset")}? This also removes the stored file.`,
      )
    ) {
      return;
    }
    try {
      await deletePortfolioAssetAction(kind, asId(record));
      setMessage("The asset and its stored file were deleted.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The asset could not be deleted.",
      );
    }
  }

  async function uploadAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("asset-file");
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.[0]) {
      setUploadError("Choose a file to upload.");
      return;
    }
    const file = fileInput.files[0];
    const safeName = file.name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const storageBucket =
      uploadKind === "image" ? "portfolio-media" : "resume-documents";
    const storagePath = `${Date.now()}-${safeName}`;
    const formData = new FormData();
    formData.set("storage_bucket", storageBucket);
    formData.set("storage_path", storagePath);
    formData.set("file", file);
    setUploading(true);
    setUploadError("");
    try {
      await uploadPortfolioAssetAction(formData);
      form.reset();
      setMessage("File uploaded privately. Publish it from the asset list when ready.");
      router.refresh();
    } catch (caught) {
      setUploadError(
        caught instanceof Error ? caught.message : "The upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="cms-shell">
      <aside className="cms-sidebar" aria-label="Administrator navigation">
        <a className="cms-brand" href="/admin">
          <span className="cms-brand-mark">M.</span>
          <span>
            <strong>Masum</strong>
            <small>Portfolio CMS</small>
          </span>
        </a>
        <nav className="cms-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={section === id ? "page" : undefined}
              className={`cms-nav-item${section === id ? " is-active" : ""}`}
              key={id}
              onClick={() => {
                setSection(id);
                setFilter("");
                setCategoryFilter("");
                setMessage("");
                setError("");
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.7} />
              <span>{label}</span>
              {id === "messages" && overview.unreadMessageCount > 0 ? (
                <span className="cms-nav-count">{overview.unreadMessageCount}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="cms-sidebar-bottom">
          <LinkButton href="/" variant="quiet">
            <ExternalLink aria-hidden="true" size={15} />
            View portfolio
          </LinkButton>
          <form action={signOutAction}>
            <button className="cms-nav-item" type="submit">
              <LogOut aria-hidden="true" size={17} strokeWidth={1.7} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="cms-main">
        <header className="cms-topbar">
          <span>Administrator workspace</span>
          <span>{overview.email}</span>
        </header>
        <div className="cms-content">
          <div className="cms-page-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                Portfolio management
              </p>
              <h1>{sectionTitle(section)}</h1>
              <p className="cms-lede">
                Manage published content and private portfolio records.
              </p>
            </div>
            {canCreate(section) ? (
              <Button
                onClick={() => startEditor(editorSectionFor(section, categoryKind, assetKind))}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                New {singularName(section)}
              </Button>
            ) : null}
          </div>

          {message ? (
            <Notification className="cms-flash" tone="success">
              {message}
            </Notification>
          ) : null}
          {error ? (
            <Notification className="cms-flash" tone="error">
              {error}
            </Notification>
          ) : null}

          {section === "dashboard" ? (
            <DashboardPanel
              overview={overview}
              onNavigate={(value) => setSection(value)}
            />
          ) : section === "profile" || section === "settings" ? (
            <SingletonPanel
              data={data}
              section={section}
              onEdit={() => {
                const value =
                  section === "profile" ? data.profile : data.siteSettings;
                startEditor(
                  section,
                  value ? Object.fromEntries(Object.entries(value)) : undefined,
                );
              }}
            />
          ) : section === "messages" ? (
            <MessagesPanel
              messages={asRecords(data.messages)}
              onDelete={removeMessage}
              onStatus={updateMessageStatus}
            />
          ) : section === "assets" ? (
            <AssetsPanel
              data={data}
              assetKind={assetKind}
              onAssetKindChange={setAssetKind}
              onDelete={removeAsset}
              onEdit={startEditor}
              onUpload={uploadAsset}
              uploadError={uploadError}
              uploadKind={uploadKind}
              onUploadKindChange={setUploadKind}
              uploading={uploading}
            />
          ) : (
            <>
              {section === "categories" ? (
                <div className="cms-segmented" aria-label="Category type">
                  <button
                    aria-pressed={categoryKind === "projects"}
                    onClick={() => setCategoryKind("projects")}
                    type="button"
                  >
                    Project categories
                  </button>
                  <button
                    aria-pressed={categoryKind === "skills"}
                    onClick={() => setCategoryKind("skills")}
                    type="button"
                  >
                    Skill categories
                  </button>
                </div>
              ) : null}
              <div className="cms-toolbar">
                <label className="cms-search">
                  <Search aria-hidden="true" size={16} />
                  <span className="sr-only">Search {sectionTitle(section).toLowerCase()}</span>
                  <input
                    onChange={(event) => setFilter(event.currentTarget.value)}
                    placeholder={`Search ${sectionTitle(section).toLowerCase()}`}
                    value={filter}
                  />
                </label>
                {section === "projects" ? (
                  <label className="cms-filter">
                    <span className="sr-only">Filter projects by category</span>
                    <select
                      onChange={(event) =>
                        setCategoryFilter(event.currentTarget.value)
                      }
                      value={categoryFilter}
                    >
                      <option value="">All categories</option>
                      {data.projectCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <span className="cms-count">
                  {filteredRows.length} {filteredRows.length === 1 ? "record" : "records"}
                </span>
              </div>
              {pendingRecordAction ? (
                <p className="cms-note" role="status">
                  {pendingRecordAction.endsWith(":order")
                    ? "Updating display order…"
                    : "Deleting record…"}
                </p>
              ) : null}
              {filteredRows.length ? (
                <RecordTable
                  categoryKind={categoryKind}
                  onDelete={removeRecord}
                  onEdit={(record, duplicate) =>
                    startEditor(
                      editorSectionFor(section, categoryKind, assetKind),
                      record,
                      duplicate,
                    )
                  }
                  onPreview={setPreview}
                  onProjectToggle={toggleProject}
                  onReorder={reorder}
                  pendingRecordAction={pendingRecordAction}
                  records={filteredRows}
                  section={section}
                />
              ) : (
                <div className="cms-empty">
                  <FileText aria-hidden="true" size={24} strokeWidth={1.5} />
                  <h2>{filter ? "No matching records" : "Nothing here yet"}</h2>
                  <p>
                    {filter
                      ? "Try a different search or category filter."
                      : "Create the first record when you have verified content to add."}
                  </p>
                  {!filter && canCreate(section) ? (
                    <Button
                      onClick={() =>
                        startEditor(editorSectionFor(section, categoryKind, assetKind))
                      }
                      type="button"
                      variant="secondary"
                    >
                      <Plus aria-hidden="true" size={16} />
                      Add {singularName(section)}
                    </Button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {editor ? (
        <EditorDialog
          definitions={editorDefinitions}
          editor={editor}
          initialValues={toFormValues(editor.record, editorDefinitions)}
          onClose={closeEditor}
          onSave={saveEditor}
          saveError={editorError}
          saving={saving}
        />
      ) : null}
      <Dialog
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        open={Boolean(preview)}
        title="Project preview"
      >
        {preview ? (
          <div className="cms-preview">
            <p className="eyebrow">Private content preview</p>
            <h3>{asString(preview.title)}</h3>
            <p>{asString(preview.summary)}</p>
            {preview.thumbnail_url ? (
              asString(preview.thumbnail_url).startsWith(
                PORTFOLIO_IMAGE_REFERENCE_PREFIX,
              ) ? (
                <p className="cms-note">
                  Uploaded image preview is available on the public site after its asset is published.
                </p>
              ) : (
                <Image
                  alt={asString(preview.thumbnail_alt) || "Project image preview"}
                  height={450}
                  unoptimized
                  src={asString(preview.thumbnail_url)}
                  width={900}
                />
              )
            ) : null}
            <p>{asString(preview.description) || "No overview added yet."}</p>
            <p className="cms-preview-meta">
              {asString(preview.status)} · {preview.featured ? "Featured" : "Not featured"}
            </p>
            <Button onClick={() => setPreview(null)} type="button" variant="secondary">
              Close preview
            </Button>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function sectionTitle(section: string): string {
  return navItems.find((item) => item.id === section)?.label ?? "Overview";
}

function singularName(section: string): string {
  const names: Record<string, string> = {
    projects: "project",
    skills: "skill",
    services: "service",
    experience: "entry",
    research: "publication",
    education: "education record",
    certifications: "credential",
    categories: "category",
    assets: "asset",
  };
  return names[section] ?? "record";
}

function canCreate(section: string): boolean {
  return [
    "projects",
    "skills",
    "services",
    "experience",
    "research",
    "education",
    "certifications",
    "categories",
  ].includes(section);
}

function editorSectionFor(
  section: string,
  categoryKind: "projects" | "skills",
  assetKind: "media-assets" | "resume-assets",
): EditorSection {
  if (section === "categories") {
    return categoryKind === "projects" ? "project-categories" : "skill-categories";
  }
  if (section === "assets") return assetKind;
  return section as EditorSection;
}

function DashboardPanel({
  overview,
  onNavigate,
}: {
  overview: Awaited<ReturnType<typeof getAdminOverviewAction>>;
  onNavigate: (section: string) => void;
}) {
  const metrics = [
    ["Total projects", overview.projectCount],
    ["Published projects", overview.publishedProjectCount],
    ["Featured projects", overview.featuredProjectCount],
    ["Total skills", overview.skillCount],
    ["Active services", overview.activeServiceCount],
    ["Unread messages", overview.unreadMessageCount],
  ] as const;
  return (
    <div className="cms-dashboard">
      <div className="cms-metrics">
        {metrics.map(([label, value]) => (
          <article className="cms-metric" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="cms-dashboard-grid">
        <section className="cms-panel">
          <div className="cms-panel-heading">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2>Recent messages</h2>
            </div>
            <button onClick={() => onNavigate("messages")} type="button">
              View all
            </button>
          </div>
          {overview.recentMessages.length ? (
            <ul className="cms-activity-list">
              {overview.recentMessages.map((item) => (
                <li key={item.id}>
                  <span className={`cms-status-dot status-${item.status}`} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.subject}</small>
                  </span>
                  <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cms-inline-empty">No contact messages received yet.</div>
          )}
        </section>
        <section className="cms-panel">
          <div className="cms-panel-heading">
            <div>
              <p className="eyebrow">Content</p>
              <h2>Recently updated projects</h2>
            </div>
            <button onClick={() => onNavigate("projects")} type="button">
              Manage
            </button>
          </div>
          {overview.recentProjects.length ? (
            <ul className="cms-activity-list">
              {overview.recentProjects.map((item) => (
                <li key={item.id}>
                  <span className={`cms-status-dot status-${item.status}`} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.featured ? "Featured" : "Standard project"}</small>
                  </span>
                  <time dateTime={item.updated_at}>
                    {new Date(item.updated_at).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cms-inline-empty">No projects have been added.</div>
          )}
        </section>
      </div>
      <div className="cms-dashboard-grid cms-dashboard-bottom">
        <section className="cms-panel">
          <div className="cms-panel-heading">
            <div>
              <p className="eyebrow">Configuration</p>
              <h2>Setup checks</h2>
            </div>
            {overview.missingConfiguration.length ? (
              <span className="cms-warning-count">
                {overview.missingConfiguration.length} to review
              </span>
            ) : (
              <span className="cms-good">Ready</span>
            )}
          </div>
          {overview.missingConfiguration.length ? (
            <ul className="cms-warning-list">
              {overview.missingConfiguration.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                  <button
                    onClick={() =>
                      onNavigate(
                        item.includes("profile") || item.includes("email")
                          ? "profile"
                          : "settings",
                      )
                    }
                    type="button"
                  >
                    Configure
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cms-inline-empty">
              Required profile and site details are configured.
            </p>
          )}
        </section>
        <section className="cms-panel cms-quick-actions">
          <p className="eyebrow">Shortcuts</p>
          <h2>Quick actions</h2>
          <button onClick={() => onNavigate("projects")} type="button">
            <Plus aria-hidden="true" size={16} /> Add or update a project
          </button>
          <button onClick={() => onNavigate("messages")} type="button">
            <MessageSquare aria-hidden="true" size={16} /> Review contact messages
          </button>
          <button onClick={() => onNavigate("profile")} type="button">
            <UserRound aria-hidden="true" size={16} /> Update profile
          </button>
        </section>
      </div>
    </div>
  );
}

function SingletonPanel({
  data,
  section,
  onEdit,
}: {
  data: AdminCmsData;
  section: "profile" | "settings";
  onEdit: () => void;
}) {
  const source =
    section === "profile" ? data.profile : data.siteSettings;
  const record = source
    ? Object.fromEntries(Object.entries(source))
    : null;
  const title = section === "profile" ? "Portfolio profile" : "Website settings";
  if (!record) {
    return (
      <div className="cms-empty">
        <Settings aria-hidden="true" size={24} />
        <h2>{title} is not configured</h2>
        <p>Apply the latest database migrations and seed the initial row before editing.</p>
        <Button onClick={onEdit} type="button" variant="secondary">
          <Plus aria-hidden="true" size={15} />
          Configure {title.toLowerCase()}
        </Button>
      </div>
    );
  }
  const fields =
    section === "profile"
      ? ["name", "professional_title", "headline", "email", "phone", "location"]
      : ["site_title", "website_url", "theme_default", "is_published"];
  return (
    <section className="cms-panel cms-singleton-panel">
      <div className="cms-panel-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{String(record.name ?? record.site_title ?? title)}</h2>
        </div>
        <Button onClick={onEdit} type="button" variant="secondary">
          <Pencil aria-hidden="true" size={15} /> Edit details
        </Button>
      </div>
      <dl className="cms-singleton-fields">
        {fields.map((key) => (
          <div key={key}>
            <dt>{key.replaceAll("_", " ")}</dt>
            <dd>{displayValue(record, key)}</dd>
          </div>
        ))}
      </dl>
      {section === "settings" ? (
        <p className="cms-note">
          Analytics configuration is stored here; this CMS does not inject tracking code.
        </p>
      ) : null}
    </section>
  );
}

function MessagesPanel({
  messages,
  onDelete,
  onStatus,
}: {
  messages: CmsRecord[];
  onDelete: (record: CmsRecord) => void;
  onStatus: (record: CmsRecord, status: string) => void;
}) {
  if (!messages.length) {
    return (
      <div className="cms-empty">
        <MessageSquare aria-hidden="true" size={24} />
        <h2>Your inbox is clear</h2>
        <p>Contact form submissions will appear here once received.</p>
      </div>
    );
  }
  return (
    <div className="cms-table-wrap">
      <table className="cms-table">
        <thead>
          <tr>
            <th>Sender</th>
            <th>Subject & message</th>
            <th>Received</th>
            <th>Status</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {messages.map((record) => (
            <tr key={asId(record)}>
              <td>
                <strong>{asString(record.name)}</strong>
                <a href={`mailto:${asString(record.email)}`}>
                  {asString(record.email)}
                </a>
              </td>
              <td className="cms-message-cell">
                <strong>{asString(record.subject)}</strong>
                <p>{asString(record.message)}</p>
              </td>
              <td>{new Date(asString(record.created_at)).toLocaleString()}</td>
              <td>
                <select
                  aria-label={`Status for message from ${asString(record.name)}`}
                  onChange={(event) =>
                    onStatus(record, event.currentTarget.value)
                  }
                  value={asString(record.status)}
                >
                  <option value="received">Unread</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>
              </td>
              <td>
                <button
                  aria-label={`Delete message from ${asString(record.name)}`}
                  className="cms-icon-button is-danger"
                  onClick={() => onDelete(record)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordTable({
  records,
  section,
  categoryKind,
  onEdit,
  onDelete,
  onProjectToggle,
  onPreview,
  onReorder,
  pendingRecordAction,
}: {
  records: CmsRecord[];
  section: string;
  categoryKind: "projects" | "skills";
  onEdit: (record: CmsRecord, duplicate?: boolean) => void;
  onDelete: (
    table:
      | "projects"
      | "project_categories"
      | "skill_categories"
      | "skills"
      | "services"
      | "experiences"
      | "education"
      | "certifications"
      | "research_publications",
    record: CmsRecord,
    description: string,
  ) => void;
  onProjectToggle: (
    record: CmsRecord,
    changes: { status?: "draft" | "published"; featured?: boolean },
  ) => void;
  onPreview: (record: CmsRecord) => void;
  onReorder: (
    type:
      | "projects"
      | "skills"
      | "services"
      | "experiences"
      | "education"
      | "certifications"
      | "research_publications",
    record: CmsRecord,
    offset: -1 | 1,
  ) => void;
  pendingRecordAction: string | null;
}) {
  const columns = tableColumns(section);
  const deleteTable = tableName(section, categoryKind);
  const orderTable = orderTableName(section);
  return (
    <div className="cms-table-wrap">
      <table className="cms-table">
        <thead>
          <tr>
            {columns.map(([key, label]) => <th key={key}>{label}</th>)}
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              aria-busy={
                (orderTable !== null &&
                  pendingRecordAction ===
                    `${orderTable}:${asId(record)}:order`) ||
                (deleteTable !== null &&
                  pendingRecordAction ===
                    `${deleteTable}:${asId(record)}:delete`)
              }
              key={asId(record)}
            >
              {columns.map(([key]) => (
                <td key={key}>
                  {key === "status" || key === "is_published" ? (
                    <span
                      className={`cms-pill ${
                        record.status === "published" || record.is_published
                          ? "is-published"
                          : "is-draft"
                      }`}
                    >
                      {record.status === "published" || record.is_published
                        ? "Published"
                        : record.status === "draft"
                          ? "Draft"
                          : "Hidden"}
                    </span>
                  ) : key === "featured" ? (
                    record.featured ? "Featured" : "—"
                  ) : (
                    displayValue(record, key)
                  )}
                </td>
              ))}
              <td className="cms-actions-cell">
                {section === "projects" ? (
                  <>
                    <button
                      aria-label={`Preview ${asString(record.title)}`}
                      className="cms-icon-button"
                      onClick={() => onPreview(record)}
                      title="Preview project"
                      type="button"
                    >
                      <Eye aria-hidden="true" size={15} />
                    </button>
                    <button
                      className="cms-text-action"
                      onClick={() =>
                        onProjectToggle(record, {
                          status:
                            record.status === "published" ? "draft" : "published",
                        })
                      }
                      type="button"
                    >
                      {record.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="cms-icon-button"
                      onClick={() =>
                        onProjectToggle(record, { featured: !record.featured })
                      }
                      title={record.featured ? "Remove featured" : "Feature project"}
                      type="button"
                    >
                      <Check aria-hidden="true" size={15} />
                    </button>
                    <button
                      aria-label={`Duplicate ${asString(record.title)}`}
                      className="cms-icon-button"
                      onClick={() => onEdit(record, true)}
                      title="Duplicate project"
                      type="button"
                    >
                      <Copy aria-hidden="true" size={15} />
                    </button>
                  </>
                ) : null}
                {orderTable ? (
                  <>
                    <button
                      aria-label={`Move ${displayValue(record, columns[0][0])} earlier`}
                      className="cms-icon-button"
                      disabled={Boolean(pendingRecordAction)}
                      onClick={() => onReorder(orderTable, record, -1)}
                      title="Move earlier"
                      type="button"
                    >
                      <ArrowUp aria-hidden="true" size={15} />
                    </button>
                    <button
                      aria-label={`Move ${displayValue(record, columns[0][0])} later`}
                      className="cms-icon-button"
                      disabled={Boolean(pendingRecordAction)}
                      onClick={() => onReorder(orderTable, record, 1)}
                      title="Move later"
                      type="button"
                    >
                      <ArrowDown aria-hidden="true" size={15} />
                    </button>
                  </>
                ) : null}
                <button
                  aria-label={`Edit ${displayValue(record, columns[0][0])}`}
                  className="cms-icon-button"
                  onClick={() => onEdit(record)}
                  title="Edit"
                  type="button"
                >
                  <Pencil aria-hidden="true" size={15} />
                </button>
                {deleteTable ? (
                  <button
                    aria-label={`Delete ${displayValue(record, columns[0][0])}`}
                    className="cms-icon-button is-danger"
                    disabled={Boolean(pendingRecordAction)}
                    onClick={() =>
                      onDelete(
                        deleteTable,
                        record,
                        displayValue(record, columns[0][0]),
                      )
                    }
                    title="Delete"
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function tableColumns(section: string): [string, string][] {
  const columns: Record<string, [string, string][]> = {
    projects: [
      ["title", "Project"],
      ["category", "Category"],
      ["status", "Status"],
      ["featured", "Featured"],
      ["display_order", "Order"],
    ],
    skills: [
      ["name", "Skill"],
      ["category_name", "Category"],
      ["proficiency", "Proficiency"],
      ["is_published", "Visibility"],
      ["display_order", "Order"],
    ],
    services: [
      ["title", "Service"],
      ["availability", "Availability"],
      ["is_available", "Available"],
      ["is_published", "Status"],
      ["display_order", "Order"],
    ],
    experience: [
      ["role", "Role"],
      ["organization", "Organization"],
      ["kind", "Type"],
      ["period_label", "Period"],
      ["start_date", "Start date"],
      ["is_published", "Status"],
    ],
    research: [
      ["title", "Publication"],
      ["venue", "Venue"],
      ["publication_year", "Year"],
      ["source_url", "Source URL"],
      ["is_published", "Status"],
      ["display_order", "Order"],
    ],
    education: [
      ["qualification", "Qualification"],
      ["institution", "Institution"],
      ["field_of_study", "Field of study"],
      ["is_published", "Status"],
      ["display_order", "Order"],
    ],
    certifications: [
      ["name", "Credential"],
      ["issuer", "Issuer"],
      ["kind", "Type"],
      ["is_published", "Status"],
      ["display_order", "Order"],
    ],
    categories: [
      ["name", "Category"],
      ["slug", "Slug"],
      ["display_order", "Order"],
    ],
    assets: [
      ["file_name", "Asset"],
      ["storage_path", "Storage path"],
      ["is_published", "Visibility"],
    ],
  };
  return columns[section] ?? [["name", "Name"]];
}

function tableName(
  section: string,
  categoryKind: "projects" | "skills",
):
  | "projects"
  | "project_categories"
  | "skill_categories"
  | "skills"
  | "services"
  | "experiences"
  | "education"
  | "certifications"
  | "research_publications"
  | null {
  if (section === "categories") {
    return categoryKind === "projects" ? "project_categories" : "skill_categories";
  }
  if (section === "experience") return "experiences";
  if (section === "research") return "research_publications";
  if (
    section === "projects" ||
    section === "skills" ||
    section === "services" ||
    section === "education" ||
    section === "certifications"
  ) {
    return section;
  }
  return null;
}

function orderTableName(
  section: string,
):
  | "projects"
  | "skills"
  | "services"
  | "experiences"
  | "education"
  | "certifications"
  | "research_publications"
  | null {
  if (section === "experience") return "experiences";
  if (section === "research") return "research_publications";
  if (
    section === "projects" ||
    section === "skills" ||
    section === "services" ||
    section === "education" ||
    section === "certifications"
  ) {
    return section;
  }
  return null;
}

function EditorDialog({
  editor,
  definitions,
  initialValues,
  onClose,
  onSave,
  saveError,
  saving,
}: {
  editor: { section: EditorSection; record: CmsRecord; id: string | null };
  definitions: FieldDefinition[];
  initialValues: FormValues;
  onClose: (dirty: boolean) => void;
  onSave: (values: FormValues) => void;
  saveError: string;
  saving: boolean;
}) {
  const [values, setValues] = useState(initialValues);
  const [localError, setLocalError] = useState("");
  const initialSignature = JSON.stringify(initialValues);
  const dirty = JSON.stringify(values) !== initialSignature;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function setValue(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    try {
      onSave(values);
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : "Review the form values.",
      );
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) onClose(dirty);
      }}
      open
      title={`${editor.id ? "Edit" : "Create"} ${editor.section.replaceAll("-", " ")}`}
    >
      <form className="cms-editor-form" onSubmit={submit}>
        {localError ? <Notification tone="error">{localError}</Notification> : null}
        {saveError ? <Notification tone="error">{saveError}</Notification> : null}
        {definitions.map((definition) => (
          <label
            className={
              definition.kind === "checkbox"
                ? "cms-checkbox-field"
                : "ui-field"
            }
            key={definition.name}
          >
            {definition.kind === "checkbox" ? (
              <>
                <input
                  checked={values[definition.name] === true}
                  onChange={(event) =>
                    setValue(definition.name, event.currentTarget.checked)
                  }
                  type="checkbox"
                />
                <span>{definition.label}</span>
              </>
            ) : (
              <>
                <span className="ui-label">{definition.label}</span>
                {definition.kind === "textarea" ||
                definition.kind === "lines" ||
                definition.kind === "json" ? (
                  <textarea
                    className="ui-control ui-textarea"
                    onChange={(event) =>
                      setValue(definition.name, event.currentTarget.value)
                    }
                    rows={definition.kind === "json" ? 7 : 4}
                    value={String(values[definition.name] ?? "")}
                  />
                ) : definition.kind === "multi-select" ? (
                  <select
                    className="ui-control ui-select cms-multiselect"
                    multiple
                    onChange={(event) =>
                      setValue(
                        definition.name,
                        Array.from(
                          event.currentTarget.selectedOptions,
                          (option) => option.value,
                        ),
                      )
                    }
                    value={asStringArray(values[definition.name])}
                  >
                    {(definition.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : definition.kind === "select" ? (
                  <select
                    className="ui-control ui-select"
                    onChange={(event) =>
                      setValue(definition.name, event.currentTarget.value)
                    }
                    value={String(values[definition.name] ?? "")}
                  >
                    {(definition.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="ui-control"
                    onChange={(event) =>
                      setValue(definition.name, event.currentTarget.value)
                    }
                    step={definition.kind === "number" ? "any" : undefined}
                    type={
                      definition.kind === "number"
                        ? "number"
                        : definition.kind === "date"
                          ? "date"
                          : definition.kind === "url"
                            ? "url"
                            : "text"
                    }
                    value={String(values[definition.name] ?? "")}
                  />
                )}
                {definition.hint ? (
                  <small className="cms-field-hint">{definition.hint}</small>
                ) : null}
              </>
            )}
          </label>
        ))}
        <div className="cms-dialog-actions">
          <Button
            disabled={saving}
            onClick={() => onClose(dirty)}
            type="button"
            variant="secondary"
          >
            <X aria-hidden="true" size={15} />
            Cancel
          </Button>
          <Button disabled={saving} type="submit">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function AssetsPanel({
  data,
  assetKind,
  onAssetKindChange,
  onDelete,
  onEdit,
  onUpload,
  uploadError,
  uploadKind,
  onUploadKindChange,
  uploading,
}: {
  data: AdminCmsData;
  assetKind: "media-assets" | "resume-assets";
  onAssetKindChange: (kind: "media-assets" | "resume-assets") => void;
  onDelete: (kind: "media_assets" | "resume_assets", record: CmsRecord) => void;
  onEdit: (section: EditorSection, record?: CmsRecord) => void;
  onUpload: (event: FormEvent<HTMLFormElement>) => void;
  uploadError: string;
  uploadKind: "image" | "resume";
  onUploadKindChange: (kind: "image" | "resume") => void;
  uploading: boolean;
}) {
  const records =
    assetKind === "media-assets"
      ? asRecords(data.mediaAssets)
      : asRecords(data.resumeAssets);
  return (
    <div className="cms-assets-layout">
      <section className="cms-panel">
        <div className="cms-panel-heading">
          <div>
            <p className="eyebrow">Private storage</p>
            <h2>Upload a new asset</h2>
          </div>
        </div>
        <form className="cms-upload-form" onSubmit={onUpload}>
          <label className="ui-field">
            <span className="ui-label">Asset type</span>
            <select
              className="ui-control ui-select"
              onChange={(event) =>
                onUploadKindChange(
                  event.currentTarget.value === "resume" ? "resume" : "image",
                )
              }
              value={uploadKind}
            >
              <option value="image">Portfolio image</option>
              <option value="resume">Resume PDF</option>
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-label">File</span>
            <input
              accept={
                uploadKind === "image"
                  ? "image/jpeg,image/png,image/webp,image/avif"
                  : "application/pdf,.pdf"
              }
              className="ui-control cms-file-input"
              name="asset-file"
              required
              type="file"
            />
          </label>
          {uploadError ? <Notification tone="error">{uploadError}</Notification> : null}
          <p className="cms-note">
            Uploads remain private until their metadata is published. Maximum file size: 10 MB.
          </p>
          <Button disabled={uploading} type="submit">
            {uploading ? "Uploading…" : "Upload privately"}
          </Button>
        </form>
      </section>
      <section className="cms-panel cms-assets-list">
        <div className="cms-panel-heading">
          <div>
            <p className="eyebrow">Asset library</p>
            <h2>{assetKind === "media-assets" ? "Portfolio images" : "Resume files"}</h2>
          </div>
          <select
            aria-label="Select asset type"
            className="cms-inline-select"
            onChange={(event) =>
              onAssetKindChange(
                event.currentTarget.value === "resume-assets"
                  ? "resume-assets"
                  : "media-assets",
              )
            }
            value={assetKind}
          >
            <option value="media-assets">Images</option>
            <option value="resume-assets">Resumes</option>
          </select>
        </div>
        {records.length ? (
          <ul className="cms-asset-list">
            {records.map((record) => (
              <li key={asId(record)}>
                <span className="cms-asset-icon">
                  {assetKind === "resume-assets" ? (
                    <FileText aria-hidden="true" size={18} />
                  ) : (
                    <Eye aria-hidden="true" size={18} />
                  )}
                </span>
                <span className="cms-asset-details">
                  <strong>
                    {asString(record.file_name) ||
                      asString(record.storage_path).split("/").at(-1)}
                  </strong>
                  <small>{asString(record.storage_path)}</small>
                </span>
                <span
                  className={`cms-pill ${record.is_published ? "is-published" : "is-draft"}`}
                >
                  {record.is_published ? "Published" : "Private"}
                </span>
                <button
                  aria-label={`Edit asset ${asString(record.file_name ?? record.storage_path)}`}
                  className="cms-icon-button"
                  onClick={() =>
                    onEdit(assetKind, record)
                  }
                  type="button"
                >
                  <Pencil aria-hidden="true" size={15} />
                </button>
                <button
                  aria-label={`Delete asset ${asString(record.file_name ?? record.storage_path)}`}
                  className="cms-icon-button is-danger"
                  onClick={() =>
                    onDelete(
                      assetKind === "media-assets"
                        ? "media_assets"
                        : "resume_assets",
                      record,
                    )
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="cms-inline-empty">
            No {assetKind === "media-assets" ? "images" : "resume files"} uploaded yet.
          </div>
        )}
      </section>
    </div>
  );
}
