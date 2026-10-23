"use server";

import {
  createProject,
  deleteAdminContent,
  deleteAdminAsset,
  deleteContactMessage,
  deleteRelatedProject,
  getAdminOverview,
  listAdminContactMessages,
  listAdminContent,
  listAdminSingleton,
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
  saveTestimonial,
  updateContactMessageStatus,
  updateContentOrder,
  updateMediaAsset,
  updatePortfolioProfile,
  updateProject,
  updateSiteSettings,
} from "@/lib/admin/data";
import { uploadAdminAsset } from "@/lib/storage";

export async function createProjectAction(input: unknown) {
  return createProject(input);
}

export async function updateProjectAction(id: unknown, input: unknown) {
  return updateProject(id, input);
}

export async function deletePortfolioContentAction(
  table:
    | "projects"
    | "project_categories"
    | "skill_categories"
    | "skills"
    | "services"
    | "experiences"
    | "education"
    | "certifications"
    | "research_publications"
    | "testimonials",
  id: unknown,
) {
  return deleteAdminContent(table, id);
}

export async function deletePortfolioAssetAction(
  kind: "media_assets" | "resume_assets",
  id: unknown,
) {
  return deleteAdminAsset(kind, id);
}

export async function saveProjectCategoryAction(
  id: unknown | null,
  input: unknown,
) {
  return saveProjectCategory(id, input);
}

export async function saveRelatedProjectAction(input: unknown) {
  return saveRelatedProject(input);
}

export async function deleteRelatedProjectAction(
  projectId: unknown,
  relatedProjectId: unknown,
) {
  return deleteRelatedProject(projectId, relatedProjectId);
}

export async function saveSkillCategoryAction(
  id: unknown | null,
  input: unknown,
) {
  return saveSkillCategory(id, input);
}

export async function saveSkillAction(id: unknown | null, input: unknown) {
  return saveSkill(id, input);
}

export async function saveServiceAction(id: unknown | null, input: unknown) {
  return saveService(id, input);
}

export async function updateProfileAction(input: unknown) {
  return updatePortfolioProfile(input);
}

export async function updateSiteSettingsAction(input: unknown) {
  return updateSiteSettings(input);
}

export async function saveExperienceAction(
  id: unknown | null,
  input: unknown,
) {
  return saveExperience(id, input);
}

export async function saveEducationAction(id: unknown | null, input: unknown) {
  return saveEducation(id, input);
}

export async function saveCertificationAction(
  id: unknown | null,
  input: unknown,
) {
  return saveCertification(id, input);
}

export async function saveResearchPublicationAction(
  id: unknown | null,
  input: unknown,
) {
  return saveResearchPublication(id, input);
}

export async function saveTestimonialAction(
  id: unknown | null,
  input: unknown,
) {
  return saveTestimonial(id, input);
}

export async function updateMediaAssetAction(id: unknown, input: unknown) {
  return updateMediaAsset(id, input);
}

export async function saveResumeAssetAction(
  id: unknown | null,
  input: unknown,
) {
  return saveResumeAsset(id, input);
}

export async function uploadPortfolioAssetAction(formData: FormData) {
  const bucket = formData.get("storage_bucket");
  const storagePath = formData.get("storage_path");
  const file = formData.get("file");

  if (
    typeof bucket !== "string" ||
    typeof storagePath !== "string" ||
    !(file instanceof File)
  ) {
    throw new Error("Choose a valid file and storage destination.");
  }

  await uploadAdminAsset(bucket, storagePath, file);
  return { uploaded: true };
}

export async function listContactMessagesAction(limit?: unknown) {
  return listAdminContactMessages(limit);
}

export async function listAdminContentAction(table: unknown) {
  return listAdminContent(table);
}

export async function listAdminSingletonAction(table: unknown) {
  return listAdminSingleton(table);
}

export async function getAdminOverviewAction() {
  return getAdminOverview();
}

export async function updateContentOrderAction(
  table:
    | "projects"
    | "skills"
    | "services"
    | "experiences"
    | "education"
    | "certifications"
    | "research_publications"
    | "testimonials",
  id: unknown,
  input: unknown,
) {
  return updateContentOrder(table, id, input);
}

export async function moveContentAction(
  table:
    | "projects"
    | "skills"
    | "services"
    | "experiences"
    | "education"
    | "certifications"
    | "research_publications"
    | "testimonials",
  id: unknown,
  direction: "up" | "down",
) {
  return moveAdminContent(table, id, direction);
}

export async function updateContactMessageStatusAction(
  id: unknown,
  status: unknown,
) {
  return updateContactMessageStatus(id, status);
}

export async function deleteContactMessageAction(id: unknown) {
  return deleteContactMessage(id);
}
