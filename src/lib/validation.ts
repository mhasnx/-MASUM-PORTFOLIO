import { z } from "zod";
import { isPortfolioImageReference } from "@/lib/portfolio/media-reference";

const optionalHttpUrl = z
  .url()
  .refine(isHttpUrl, "Use an HTTP or HTTPS URL.")
  .nullable()
  .default(null);
const optionalSafeHref = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .default(null)
  .refine(
    (value) =>
      value === null ||
      (value.startsWith("/") && !value.startsWith("//")) ||
      isHttpUrl(value),
    "Use an internal path or an HTTP or HTTPS URL.",
  );

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(1).max(5000),
});

export const adminLoginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().max(20_000).nullable().optional(),
  category_id: z.uuid().nullable().optional(),
  category: z.string().trim().max(120).nullable().optional(),
  problem: z.string().trim().max(20_000).nullable().optional(),
  approach: z.string().trim().max(20_000).nullable().optional(),
  solution: z.string().trim().max(20_000).nullable().optional(),
  tools: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  verified_results: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        value: z.string().trim().min(1).max(300),
        verified: z.literal(true),
      }),
    )
    .max(30)
    .default([]),
  screenshots: z
    .array(
      z.object({
        url: z.url().refine(isHttpUrl, "Use an HTTP or HTTPS URL."),
        alt: z.string().trim().min(1).max(300),
      }),
    )
    .max(20)
    .default([]),
  thumbnail_url: z
    .union([
      z.url().refine(isHttpUrl, "Use an HTTP or HTTPS URL."),
      z
        .string()
        .refine(
          isPortfolioImageReference,
          "Choose a valid uploaded portfolio image.",
        ),
    ])
    .nullable()
    .optional(),
  thumbnail_alt: z.string().trim().max(300).nullable().optional(),
  external_url: z
    .url()
    .refine(isHttpUrl, "Use an HTTP or HTTPS URL.")
    .nullable()
    .optional(),
  source_url: z
    .url()
    .refine(isHttpUrl, "Use an HTTP or HTTPS URL.")
    .nullable()
    .optional(),
  seo_title: z
    .string()
    .trim()
    .max(70)
    .nullable()
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value || null,
    ),
  seo_description: z
    .string()
    .trim()
    .max(320)
    .nullable()
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value || null,
    ),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
  display_order: z.number().int().min(0).max(100_000).default(0),
}).refine(
  (project) =>
    !project.thumbnail_url ||
    !isPortfolioImageReference(project.thumbnail_url) ||
    Boolean(project.thumbnail_alt?.trim()),
  {
    message: "Add alt text for the selected uploaded image.",
    path: ["thumbnail_alt"],
  },
);

export const projectCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).nullable().default(null),
  display_order: z.number().int().min(0).max(100_000).default(0),
});

export const skillCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  display_order: z.number().int().min(0).max(100_000).default(0),
});

export const skillSchema = z.object({
  category_id: z.uuid().nullable(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().default(null),
  icon: z.string().trim().max(80).nullable().default(null),
  proficiency: z.number().int().min(0).max(100).nullable().default(null),
  display_order: z.number().int().min(0).max(100_000).default(0),
  is_published: z.boolean().default(false),
});

export const serviceSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(1).max(5000),
    deliverables: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
    icon: z.string().trim().max(80).nullable().default(null),
    price_amount: z
      .number()
      .finite()
      .min(0)
      .max(1_000_000_000)
      .nullable()
      .default(null),
    price_currency: z.string().regex(/^[A-Z]{3}$/).nullable().default(null),
    availability: z.string().trim().max(300).nullable().default(null),
    is_available: z.boolean().default(true),
    display_order: z.number().int().min(0).max(100_000).default(0),
    is_published: z.boolean().default(false),
  })
  .refine(
    (service) =>
      (service.price_amount === null) ===
      (service.price_currency === null),
    "Set both a price and currency, or leave both blank.",
  );

const optionalDate = z.iso.date().nullable().default(null);

export const experienceSchema = z
  .object({
    role: z.string().trim().min(1).max(160),
    organization: z.string().trim().min(1).max(160).nullable().default(null),
    kind: z
      .enum([
        "work",
        "freelance",
        "training",
        "course",
        "achievement",
        "teaching",
        "leadership",
        "community",
      ])
      .default("work"),
    description: z.string().trim().max(5000).nullable().default(null),
    external_url: optionalHttpUrl,
    skills: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
    period_label: z.string().trim().min(1).max(120).nullable().optional(),
    start_date: optionalDate,
    end_date: optionalDate,
    is_current: z.boolean().default(false),
    display_order: z.number().int().min(0).max(100_000).default(0),
    is_published: z.boolean().default(false),
  })
  .refine(
    (value) =>
      !value.end_date ||
      !value.start_date ||
      value.end_date >= value.start_date,
    "End date must not be before the start date.",
  )
  .refine((value) => !value.is_current || value.end_date === null, {
    message: "Current experience cannot have an end date.",
    path: ["end_date"],
  });

export const researchPublicationSchema = z.object({
  title: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .optional()
    .transform((value) => value || null),
  description: z
    .string()
    .trim()
    .max(20_000)
    .nullable()
    .optional()
    .transform((value) => value || null),
  authors: z.array(z.string().trim().min(1).max(300)).max(100).default([]),
  author_contribution: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional()
    .transform((value) => value || null),
  venue: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .optional()
    .transform((value) => value || null),
  publication_year: z
    .number()
    .int()
    .min(1800)
    .max(2200)
    .nullable()
    .default(null),
  doi: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .optional()
    .refine((value) => !value || /^10\.\d{4,9}\/\S+$/.test(value), {
      message: "Enter a valid DOI identifier or leave this field blank.",
    })
    .transform((value) => value || null),
  source_url: z
    .url()
    .refine(
      (value) => {
        const url = new URL(value);
        return (
          url.protocol === "https:" && !url.username && !url.password
        );
      },
      "Use an HTTPS URL without embedded credentials.",
    )
    .max(2048),
  display_order: z.number().int().min(0).max(100_000).default(0),
  is_published: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  author_name: z.string().trim().min(1).max(160),
  author_role: z.string().trim().max(160).nullable().default(null),
  organization: z.string().trim().max(160).nullable().default(null),
  quote: z.string().trim().min(1).max(5000),
  source_url: optionalHttpUrl,
  display_order: z.number().int().min(0).max(100_000).default(0),
  is_published: z.boolean().default(false),
});

export const educationSchema = z
  .object({
    institution: z.string().trim().min(1).max(200),
    qualification: z.string().trim().min(1).max(160),
    field_of_study: z.string().trim().max(160).nullable().default(null),
    description: z.string().trim().max(5000).nullable().default(null),
    external_url: optionalHttpUrl,
    skills: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
    start_date: optionalDate,
    end_date: optionalDate,
    display_order: z.number().int().min(0).max(100_000).default(0),
    is_published: z.boolean().default(false),
  })
  .refine(
    (value) =>
      !value.end_date ||
      !value.start_date ||
      value.end_date >= value.start_date,
    "End date must not be before the start date.",
  );

export const certificationSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    issuer: z.string().trim().min(1).max(200),
    kind: z
      .enum(["certification", "training", "course", "achievement"])
      .default("certification"),
    description: z.string().trim().max(5000).nullable().default(null),
    skills: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
    credential_url: z
      .url()
      .refine(isHttpUrl, "Use an HTTP or HTTPS URL.")
      .nullable()
      .default(null),
    issued_on: optionalDate,
    expires_on: optionalDate,
    display_order: z.number().int().min(0).max(100_000).default(0),
    is_published: z.boolean().default(false),
  })
  .refine(
    (value) =>
      !value.expires_on ||
      !value.issued_on ||
      value.expires_on >= value.issued_on,
    "Expiration date must not be before the issue date.",
  );

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  professional_title: z.string().trim().max(200).nullable().default(null),
  headline: z.string().trim().max(300).nullable(),
  subtitle: z.string().trim().max(300).nullable(),
  introduction: z.string().trim().max(2000).nullable(),
  biography: z.string().trim().max(20_000).nullable(),
  professional_interests: z.array(z.string().trim().min(1).max(300)).max(50),
  working_approach: z.array(z.string().trim().min(1).max(300)).max(50),
  social_links: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        url: z.url().refine(isHttpUrl, "Use an HTTP or HTTPS URL."),
      }),
    )
    .max(20),
  availability_label: z.string().trim().max(120).nullable(),
  is_available: z.boolean(),
  primary_cta_text: z.string().trim().max(80).nullable().default(null),
  primary_cta_href: optionalSafeHref,
  secondary_cta_text: z.string().trim().max(80).nullable().default(null),
  secondary_cta_href: optionalSafeHref,
  avatar_url: z
    .url()
    .refine(isHttpUrl, "Use an HTTP or HTTPS URL.")
    .nullable(),
  avatar_alt: z.string().trim().max(300).nullable(),
  courses: z.array(z.string().trim().min(1).max(200)).max(100),
  achievements: z.array(z.string().trim().min(1).max(300)).max(100),
  email: z.email().max(254).nullable(),
  phone: z.string().trim().max(40).nullable().default(null),
  location: z.string().trim().max(200).nullable(),
  is_published: z.boolean(),
});

export const siteSettingsSchema = z.object({
  site_title: z.string().trim().min(1).max(160),
  default_description: z.string().trim().min(1).max(1000),
  website_url: optionalHttpUrl,
  logo_url: optionalHttpUrl,
  favicon_url: optionalHttpUrl,
  footer_text: z.string().trim().max(500).nullable().default(null),
  theme_default: z.enum(["light", "dark", "system"]).default("light"),
  resume_asset_id: z.uuid().nullable().default(null),
  analytics_enabled: z.boolean().default(false),
  analytics_id: z
    .string()
    .trim()
    .max(80)
    .regex(/^(G-[A-Z0-9]+|GTM-[A-Z0-9]+|AW-[0-9]+)?$/)
    .nullable()
    .default(null),
  is_published: z.boolean(),
});

export const contentOrderSchema = z.object({
  display_order: z.number().int().min(0).max(100_000),
});

export const adminIdSchema = z.uuid();

export const relatedProjectSchema = z
  .object({
    project_id: z.uuid(),
    related_project_id: z.uuid(),
    display_order: z.number().int().min(0).max(100_000).default(0),
  })
  .refine((value) => value.project_id !== value.related_project_id, {
    message: "A project cannot be related to itself.",
    path: ["related_project_id"],
  });

export const uploadMetadataSchema = z.object({
  storage_bucket: z.enum(["portfolio-media", "resume-documents"]),
  storage_path: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (path) =>
        !path.startsWith("/") &&
        !path.includes("\\") &&
        path.split("/").every((segment) => segment && segment !== "." && segment !== ".."),
      "Invalid storage path.",
    ),
  media_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "application/pdf",
  ]),
  alt_text: z.string().trim().max(300).nullable(),
  is_published: z.boolean(),
});

export const resumeMetadataSchema = z.object({
  storage_bucket: z.literal("resume-documents"),
  storage_path: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (path) =>
        !path.startsWith("/") &&
        !path.includes("\\") &&
        path
          .split("/")
          .every((segment) => segment && segment !== "." && segment !== ".."),
      "Invalid storage path.",
    )
    .refine((path) => /\.pdf$/i.test(path), "Resume path must use a PDF file."),
  file_name: z.string().trim().min(1).max(255),
  display_order: z.number().int().min(0).max(100_000),
  is_published: z.boolean(),
});

function isHttpUrl(value: string): boolean {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}
