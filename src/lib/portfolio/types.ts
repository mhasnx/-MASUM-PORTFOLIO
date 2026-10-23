export type SocialLink = {
  label: string;
  url: string;
};

export type PortfolioProfile = {
  name: string;
  professionalTitle: string | null;
  headline: string;
  subtitle: string;
  introduction: string;
  biography: string | null;
  professionalInterests: string[];
  workingApproach: string[];
  availabilityLabel: string | null;
  isAvailable: boolean;
  primaryCtaText: string | null;
  primaryCtaHref: string | null;
  secondaryCtaText: string | null;
  secondaryCtaHref: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  avatarAlt: string | null;
  socialLinks: SocialLink[];
};

export type EducationItem = {
  institution: string;
  qualification: string;
  fieldOfStudy: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type SkillCategory = {
  name: string;
  skills: string[];
};

export type ServiceItem = {
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  priceAmount: number | null;
  priceCurrency: string | null;
  availability: string | null;
};

export type ExperienceItem = {
  role: string;
  organization: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  periodLabel: string | null;
  isCurrent: boolean;
};

export type CertificationItem = {
  name: string;
  issuer: string;
  credentialUrl: string | null;
  issuedOn: string | null;
};

export type SupplementalPortfolioContent = {
  researchReferences: {
    title: string;
    url: string;
    description: string;
  }[];
  teachingExperience: {
    title: string;
    period: string;
    description: string;
  }[];
  communityActivities: {
    title: string;
    role: string;
    organization: string | null;
  }[];
  interests: string[];
};

export type ProjectResult = {
  label: string;
  value: string;
  verified: boolean;
};

export type ProjectScreenshot = {
  url: string;
  alt: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  category: string | null;
  featured: boolean;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  problem: string | null;
  approach: string | null;
  solution: string | null;
  tools: string[];
  verifiedResults: ProjectResult[];
  screenshots: ProjectScreenshot[];
  liveUrl: string | null;
  sourceUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedProjects: string[];
};

export type PortfolioContent = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  footerText: string | null;
  themeDefault: "light" | "dark" | "system";
  profile: PortfolioProfile;
  education: EducationItem[];
  skillCategories: SkillCategory[];
  services: ServiceItem[];
  projects: PortfolioProject[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  courses: string[];
  achievements: string[];
  supplemental: SupplementalPortfolioContent;
  resumeUrl: string | null;
};
