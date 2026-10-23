import type { Database } from "@/types/database";

type Row<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type AdminCmsData = {
  projects: Row<"projects">[];
  projectCategories: Row<"project_categories">[];
  skills: Row<"skills">[];
  skillCategories: Row<"skill_categories">[];
  services: Row<"services">[];
  experiences: Row<"experiences">[];
  education: Row<"education">[];
  certifications: Row<"certifications">[];
  researchPublications: Row<"research_publications">[];
  projectRelated: Row<"project_related">[];
  profile: Row<"profiles"> | null;
  siteSettings: Row<"site_settings"> | null;
  messages: Row<"contact_messages">[];
  mediaAssets: Row<"media_assets">[];
  resumeAssets: Row<"resume_assets">[];
};
