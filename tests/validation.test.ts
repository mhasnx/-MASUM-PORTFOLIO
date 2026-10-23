import { describe, expect, it } from "vitest";
import {
  adminLoginSchema,
  contactMessageSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  researchPublicationSchema,
  serviceSchema,
  siteSettingsSchema,
  skillSchema,
  testimonialSchema,
  uploadMetadataSchema,
} from "../src/lib/validation";

describe("contactMessageSchema", () => {
  it("accepts a complete contact message", () => {
    expect(
      contactMessageSchema.safeParse({
        name: "Mahmudul",
        email: "hello@example.com",
        subject: "A question",
        message: "Hello there.",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email and oversized fields", () => {
    expect(
      contactMessageSchema.safeParse({
        name: "Mahmudul",
        email: "not-an-email",
        subject: "A question",
        message: "Hello there.",
      }).success,
    ).toBe(false);
    expect(
      contactMessageSchema.safeParse({
        name: "a".repeat(121),
        email: "hello@example.com",
        subject: "A question",
        message: "Hello there.",
      }).success,
    ).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("requires a valid email and non-empty password", () => {
    expect(
      adminLoginSchema.safeParse({
        email: "admin@example.com",
        password: "safe-password",
      }).success,
    ).toBe(true);
    expect(
      adminLoginSchema.safeParse({
        email: "invalid",
        password: "",
      }).success,
    ).toBe(false);
  });
});

describe("projectSchema", () => {
  const validProject = {
    title: "Example project",
    slug: "example-project",
    summary: "A short summary.",
    status: "draft",
  };

  it("accepts a valid draft", () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
    expect(projectSchema.parse(validProject).seo_title).toBeUndefined();
  });

  it("rejects unsafe slugs and unsupported publication status", () => {
    expect(
      projectSchema.safeParse({ ...validProject, slug: "../project" }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...validProject, status: "public" }).success,
    ).toBe(false);
  });

  it("rejects non-HTTP external links and negative ordering", () => {
    expect(
      projectSchema.safeParse({
        ...validProject,
        external_url: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...validProject, display_order: -1 }).success,
    ).toBe(false);
  });

  it("accepts optional SEO metadata and enforces its field limits", () => {
    expect(
      projectSchema.safeParse({
        ...validProject,
        seo_title: "Search title",
        seo_description: "A concise search description.",
      }).success,
    ).toBe(true);
    expect(
      projectSchema.safeParse({
        ...validProject,
        seo_title: "x".repeat(71),
      }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...validProject,
        seo_description: "x".repeat(321),
      }).success,
    ).toBe(false);
    expect(
      projectSchema.parse({
        ...validProject,
        seo_title: " ",
        seo_description: "",
      }),
    ).toMatchObject({ seo_title: null, seo_description: null });
  });

  it("accepts an uploaded image reference only with accessible alt text", () => {
    const uploadedImage = {
      ...validProject,
      thumbnail_url: "portfolio-asset:a78b715a-0934-4a50-8b44-11b3e721ae88",
    };
    expect(projectSchema.safeParse(uploadedImage).success).toBe(false);
    expect(
      projectSchema.safeParse({
        ...uploadedImage,
        thumbnail_alt: "Portfolio project preview",
      }).success,
    ).toBe(true);
    expect(
      projectSchema.safeParse({
        ...validProject,
        thumbnail_url: "portfolio-asset:not-a-uuid",
        thumbnail_alt: "Image",
      }).success,
    ).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("requires a price and currency to be supplied together", () => {
    expect(
      serviceSchema.safeParse({
        title: "Data cleaning",
        slug: "data-cleaning",
        description: "Clean and organize data.",
        price_amount: 25,
      }).success,
    ).toBe(false);
  });

  it("accepts optional pricing and availability without inventing a price", () => {
    expect(
      serviceSchema.safeParse({
        title: "Data cleaning",
        slug: "data-cleaning",
        description: "Clean and organize data.",
        price_amount: null,
        price_currency: null,
        is_available: false,
      }).success,
    ).toBe(true);
  });
});

describe("CMS field validation", () => {
  it("rejects unsupported proficiency and unsafe CTA destinations", () => {
    expect(
      skillSchema.safeParse({
        category_id: null,
        name: "Excel",
        proficiency: 101,
      }).success,
    ).toBe(false);

    expect(
      profileSchema.safeParse({
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
        primary_cta_href: "javascript:alert(1)",
        avatar_url: null,
        avatar_alt: null,
        courses: [],
        achievements: [],
        email: null,
        location: null,
        is_published: false,
      }).success,
    ).toBe(false);
  });

  it("validates optional date ranges and analytics identifiers", () => {
    expect(
      experienceSchema.safeParse({
        role: "Role",
        organization: "Organization",
        start_date: "2026-05-01",
        end_date: "2026-04-01",
      }).success,
    ).toBe(false);

    expect(
      experienceSchema.safeParse({
        role: "Private Tutor",
        organization: null,
        kind: "teaching",
        period_label: "2023–Present",
      }).success,
    ).toBe(true);
    expect(
      experienceSchema.parse({
        role: "Existing teaching entry",
        organization: null,
        kind: "teaching",
      }),
    ).not.toHaveProperty("period_label");

    expect(
      siteSettingsSchema.safeParse({
        site_title: "Portfolio",
        default_description: "Description",
        analytics_id: "<script>",
        is_published: true,
      }).success,
    ).toBe(false);
  });

  it.each([
    "work",
    "freelance",
    "training",
    "course",
    "achievement",
    "teaching",
    "leadership",
    "community",
  ])("retains date values and flexible periods for %s experience", (kind) => {
    const experience = experienceSchema.parse({
      role: "Verified role",
      organization: "Verified organization",
      kind,
      period_label: "2023–Present",
      start_date: "2023-01-01",
      end_date: null,
      is_current: false,
    });

    expect(experience).toMatchObject({
      kind,
      period_label: "2023–Present",
      start_date: "2023-01-01",
      end_date: null,
    });
  });
});

describe("researchPublicationSchema", () => {
  const validPublication = {
    source_url: "https://ieeexplore.ieee.org/document/11490554",
  };

  it("keeps optional publication metadata blank until verified", () => {
    expect(researchPublicationSchema.parse(validPublication)).toMatchObject({
      title: null,
      description: null,
      authors: [],
      author_contribution: null,
      venue: null,
      publication_year: null,
      doi: null,
      is_published: false,
    });
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        title: " ",
        venue: "",
        doi: "",
      }).success,
    ).toBe(true);
  });

  it("validates HTTPS source links and optional metadata", () => {
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        source_url: "http://example.com/paper",
      }).success,
    ).toBe(false);
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        source_url: "https://user:password@example.com/paper",
      }).success,
    ).toBe(false);
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        publication_year: 1700,
      }).success,
    ).toBe(false);
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        doi: "not-a-doi",
      }).success,
    ).toBe(false);
    expect(
      researchPublicationSchema.safeParse({
        ...validPublication,
        authors: ["Verified Author"],
        author_contribution: "Verified contribution",
        venue: "Verified venue",
        publication_year: 2025,
        doi: "10.1234/example",
        is_published: true,
      }).success,
    ).toBe(true);
  });
});

describe("testimonialSchema", () => {
  it("requires a named author and non-empty quote while defaulting to draft", () => {
    expect(
      testimonialSchema.parse({
        author_name: "Verified person",
        quote: "A verified comment.",
      }),
    ).toMatchObject({
      author_role: null,
      organization: null,
      source_url: null,
      display_order: 0,
      is_published: false,
    });
    expect(
      testimonialSchema.safeParse({
        author_name: " ",
        quote: " ",
      }).success,
    ).toBe(false);
  });

  it("validates optional testimonial references and publication state", () => {
    expect(
      testimonialSchema.safeParse({
        author_name: "Verified person",
        quote: "A verified comment.",
        source_url: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      testimonialSchema.safeParse({
        author_name: "Verified person",
        quote: "A verified comment.",
        source_url: "https://example.com/reference",
        is_published: true,
      }).success,
    ).toBe(true);
  });
});

describe("uploadMetadataSchema", () => {
  it("rejects unsafe storage paths and mismatched bucket media types", () => {
    expect(
      uploadMetadataSchema.safeParse({
        storage_bucket: "portfolio-media",
        storage_path: "../private/resume.pdf",
        media_type: "application/pdf",
        alt_text: null,
        is_published: false,
      }).success,
    ).toBe(false);
    expect(
      uploadMetadataSchema.safeParse({
        storage_bucket: "resume-documents",
        storage_path: "resume/masum.pdf",
        media_type: "text/html",
        alt_text: null,
        is_published: false,
      }).success,
    ).toBe(false);
  });
});
