import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PortfolioFooter } from "@/components/portfolio/footer";
import { PortfolioNavigation } from "@/components/portfolio/navigation";
import {
  getPortfolioContent,
  getPublishedProject,
} from "@/lib/portfolio/data";
import { isOptimizablePortfolioImage } from "@/lib/portfolio/image";
import {
  createPageMetadata,
  getProjectSeoMetadata,
  getSiteOrigin,
  serializeJsonLd,
} from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);

  if (!project) {
    return {
      title: "Project not found | Portfolio",
      description: "This project is not available.",
      robots: { index: false, follow: false },
    };
  }

  const content = await getPortfolioContent();
  const { title, description } = getProjectSeoMetadata(
    project,
    content.profile.name,
  );

  return createPageMetadata({
    title,
    description,
    path: `/projects/${project.slug}`,
    siteUrl: content.siteUrl,
    siteName: content.siteTitle,
    type: "article",
    image:
      project.thumbnailUrl && project.thumbnailAlt
        ? { url: project.thumbnailUrl, alt: project.thumbnailAlt }
        : null,
  });
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense fallback={<p aria-busy="true">Loading project…</p>}>
        <ProjectContent params={params} />
      </Suspense>
    </>
  );
}

async function ProjectContent({ params }: ProjectPageProps) {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = await getPublishedProject(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = project.relatedProjects
    .map((relatedSlug) =>
      content.projects.find((item) => item.slug === relatedSlug),
    )
    .filter((item) => item !== undefined);
  const siteOrigin = getSiteOrigin(content.siteUrl);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    ...(project.thumbnailUrl ? { image: project.thumbnailUrl } : {}),
    ...(project.category ? { genre: project.category } : {}),
    ...(project.tools.length > 0 ? { keywords: project.tools } : {}),
    ...(siteOrigin
      ? { url: new URL(`/projects/${project.slug}`, siteOrigin).toString() }
      : {}),
    creator: {
      "@type": "Person",
      name: content.profile.name,
      ...(siteOrigin ? { "@id": `${siteOrigin}/#person` } : {}),
    },
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
        type="application/ld+json"
      />
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
        showTestimonials={content.testimonials.length > 0}
        themeDefault={content.themeDefault}
      />
      <main className="project-page section-shell" id="main-content">
        <Link className="project-back-link" href="/projects">
          <ArrowLeft aria-hidden="true" size={15} />
          Back to projects
        </Link>
        <article>
      <p className="eyebrow">
        <span className="eyebrow-line" />
        Selected work
      </p>
      {project.category ? (
        <p className="project-category">{project.category}</p>
      ) : null}
      <h1>{project.title}</h1>
      <p className="project-summary">{project.summary}</p>
      {project.thumbnailUrl && project.thumbnailAlt ? (
        <figure className="project-detail-image">
          <Image
            alt={project.thumbnailAlt}
            fill
            priority
            sizes="(max-width: 800px) 90vw, 760px"
            src={project.thumbnailUrl}
            unoptimized={!isOptimizablePortfolioImage(project.thumbnailUrl)}
          />
          <figcaption>{project.thumbnailAlt}</figcaption>
        </figure>
      ) : null}
      {project.description ? (
        <section className="project-detail-section">
          <h2>Overview</h2>
          <p>{project.description}</p>
        </section>
      ) : null}
      {project.problem ? (
        <section className="project-detail-section">
          <h2>Problem</h2>
          <p>{project.problem}</p>
        </section>
      ) : null}
      {project.approach ? (
        <section className="project-detail-section">
          <h2>Approach</h2>
          <p>{project.approach}</p>
        </section>
      ) : null}
      {project.solution ? (
        <section className="project-detail-section">
          <h2>Solution</h2>
          <p>{project.solution}</p>
        </section>
      ) : null}
      {project.tools.length > 0 ? (
        <section className="project-detail-section">
          <h2>Tools & technologies</h2>
          <ul className="project-tool-list">
            {project.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {project.verifiedResults.length > 0 ? (
        <section className="project-detail-section">
          <h2>Verified results</h2>
          <dl className="project-result-list">
            {project.verifiedResults.map((result) => (
              <div key={`${result.label}-${result.value}`}>
                <dt>{result.label}</dt>
                <dd>{result.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {project.screenshots.length > 0 ? (
        <section className="project-detail-section">
          <h2>Project gallery</h2>
          <div className="project-screenshot-grid">
            {project.screenshots.map((screenshot) => (
              <figure
                className="project-screenshot"
                key={`${screenshot.url}-${screenshot.alt}`}
              >
                <div>
                  <Image
                    alt={screenshot.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, 45vw"
                    src={screenshot.url}
                    unoptimized={!isOptimizablePortfolioImage(screenshot.url)}
                  />
                </div>
                <figcaption>{screenshot.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      <div className="project-links">
        {project.liveUrl ? (
          <a href={project.liveUrl} rel="noreferrer" target="_blank">
            View project <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
        {project.sourceUrl ? (
          <a href={project.sourceUrl} rel="noreferrer" target="_blank">
            View source <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
      </div>
      {relatedProjects.length > 0 ? (
        <section className="project-detail-section related-projects">
          <h2>Related projects</h2>
          <ul>
            {relatedProjects.map((relatedProject) => (
              <li key={relatedProject.id}>
                <Link href={`/projects/${relatedProject.slug}`}>
                  {relatedProject.title}
                  <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
        </article>
      </main>
      <PortfolioFooter
        footerText={content.footerText}
        logoUrl={content.logoUrl}
        profile={content.profile}
        resumeUrl={content.resumeUrl}
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
