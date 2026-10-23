import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioFooter } from "@/components/portfolio/footer";
import { PortfolioNavigation } from "@/components/portfolio/navigation";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { getPortfolioContent } from "@/lib/portfolio/data";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();

  return createPageMetadata({
    title: content.profile.name
      ? `Projects | ${content.profile.name}`
      : "Projects",
    description: content.profile.introduction,
    path: "/projects",
    siteUrl: content.siteUrl,
    siteName: content.siteTitle,
    image:
      content.profile.avatarUrl && content.profile.avatarAlt
        ? {
            url: content.profile.avatarUrl,
            alt: content.profile.avatarAlt,
          }
        : null,
  });
}

export default function ProjectsPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense
        fallback={
          <main className="projects-page section-shell" aria-busy="true">
            Loading projects…
          </main>
        }
      >
        <ProjectsContent />
      </Suspense>
    </>
  );
}

async function ProjectsContent() {
  const content = await getPortfolioContent();

  return (
    <>
      <PortfolioNavigation
        showAbout={Boolean(
          content.profile.biography ||
            content.profile.professionalInterests.length > 0 ||
            content.profile.workingApproach.length > 0 ||
            content.education.length > 0,
        )}
        logoUrl={content.logoUrl}
        showServices={content.services.length > 0}
        showSkills={content.skillCategories.length > 0}
        showExperience={
          content.experience.length > 0 ||
          content.supplemental.teachingExperience.length > 0 ||
          content.supplemental.communityActivities.length > 0
        }
        showResearch={content.supplemental.researchReferences.length > 0}
        themeDefault={content.themeDefault}
      />
      <main className="projects-page section-shell" id="main-content">
        <header className="projects-page-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Selected work
          </p>
          <h1>Projects</h1>
          <p>
            A collection of practical work, shared as projects are published.
          </p>
        </header>
        <ProjectGallery projects={content.projects} />
      </main>
      <PortfolioFooter
        footerText={content.footerText}
        logoUrl={content.logoUrl}
        profile={content.profile}
        showAbout={Boolean(
          content.profile.biography ||
            content.profile.professionalInterests.length > 0 ||
            content.profile.workingApproach.length > 0 ||
            content.education.length > 0,
        )}
        showServices={content.services.length > 0}
      />
    </>
  );
}
