import { temporaryPortfolioFixtures } from "./portfolio/fixtures";

const { profile } = temporaryPortfolioFixtures;

export const initialProfile = {
  name: profile.name,
  headline: profile.headline,
  subtitle: profile.subtitle,
  bio: profile.introduction,
  isAvailable: profile.isAvailable,
  email: profile.email,
  phone: profile.phone,
  location: profile.location,
  linkedin: profile.socialLinks.find((link) => link.label === "LinkedIn")?.url,
  github: profile.socialLinks.find((link) => link.label === "GitHub")?.url,
  education: {
    degree: `${temporaryPortfolioFixtures.education[0].qualification} in ${temporaryPortfolioFixtures.education[0].fieldOfStudy}`,
    institution: temporaryPortfolioFixtures.education[0].institution,
  },
};

export const initialSkills = temporaryPortfolioFixtures.skillCategories.flatMap(
  (category) =>
    category.skills.map((name) => ({ name, category: category.name })),
);

export const initialServices = temporaryPortfolioFixtures.services.map(
  ({ title, description, deliverables }) => ({
    title,
    description,
    deliverables,
  }),
);