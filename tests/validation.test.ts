import { describe, expect, it } from "vitest";
import {
  adminLoginSchema,
  contactMessageSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  serviceSchema,
  siteSettingsSchema,
  skillSchema,
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
    expect(projectSchema.parse(validProject)).not.toHaveProperty("seo_title");
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
