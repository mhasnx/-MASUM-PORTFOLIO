import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { Suspense } from "react";
import type { PortfolioProject } from "@/lib/portfolio/types";
import { ContactForm } from "@/components/forms/contact-form";
import { PortfolioFooter } from "@/components/portfolio/footer";
import { PortfolioNavigation } from "@/components/portfolio/navigation";
import { getPortfolioContent } from "@/lib/portfolio/data";
import { isOptimizablePortfolioImage } from "@/lib/portfolio/image";
import { createPageMetadata, getSiteOrigin, serializeJsonLd } from "@/lib/seo";
import { isContactSubmissionConfigured } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();

  return {
    ...createPageMetadata({
      title: content.siteTitle,
      description: content.siteDescription,
      siteUrl: content.siteUrl,
      siteName: content.siteTitle,
      image:
        content.profile.avatarUrl && content.profile.avatarAlt
          ? {
              url: content.profile.avatarUrl,
              alt: content.profile.avatarAlt,
            }
          : null,
    }),
    icons: content.faviconUrl
      ? { icon: content.faviconUrl }
      : undefined,
  };
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="home-loading section-shell" aria-busy="true">
          Loading portfolio…
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const content = await getPortfolioContent();
  const { profile } = content;
  const contactFormEnabled = isContactSubmissionConfigured();
  const siteOrigin = getSiteOrigin(content.siteUrl);
  const personSchema = {
    "@type": "Person",
    ...(profile.name ? { name: profile.name } : {}),
    ...(profile.professionalTitle
      ? { jobTitle: profile.professionalTitle }
      : {}),
    ...(profile.introduction ? { description: profile.introduction } : {}),
    ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
    ...(siteOrigin ? { url: siteOrigin, "@id": `${siteOrigin}/#person` } : {}),
    ...(profile.socialLinks.length > 0
      ? { sameAs: profile.socialLinks.map((social) => social.url) }
      : {}),
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      personSchema,
      {
        "@type": "WebSite",
        name: content.siteTitle,
        ...(siteOrigin ? { url: siteOrigin, "@id": `${siteOrigin}/#website` } : {}),
      },
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
        type="application/ld+json"
      />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <PortfolioNavigation
        showAbout={Boolean(
          profile.biography ||
            profile.professionalInterests.length > 0 ||
            profile.workingApproach.length > 0 ||
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

      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="hero section-shell"
          id="home"
        >
          <div className="hero-copy">
            {profile.isAvailable && profile.availabilityLabel ? (
              <p className="availability-indicator">
                <span aria-hidden="true" />
                {profile.availabilityLabel}
              </p>
            ) : null}
            <p className="eyebrow">
              <span className="eyebrow-line" />
              A curious mind, a practical approach
            </p>
            {profile.name ? (
              <h1 id="hero-title">
                {profile.name.replace(/\s+Masum$/, "")}
                {profile.name.endsWith(" Masum") ? (
                  <>
                    <br />
                    <span className="hero-name-last">Masum</span>
                  </>
                ) : null}
              </h1>
            ) : (
              <h1 id="hero-title">Portfolio in progress</h1>
            )}
            {profile.headline ? (
              <p className="hero-headline">{profile.headline}</p>
            ) : null}
            {profile.subtitle ? (
              <p className="hero-subtitle">{profile.subtitle}</p>
            ) : null}
            {profile.professionalTitle ? (
              <p className="hero-professional-title">
                {profile.professionalTitle}
              </p>
            ) : null}
            {profile.introduction ? (
              <p className="hero-intro">{profile.introduction}</p>
            ) : null}
            <div className="hero-actions">
              <a
                className="button button-dark"
                href={profile.primaryCtaHref || "#contact"}
              >
                {profile.primaryCtaText || "Let’s Work Together"}
                <ArrowRight aria-hidden="true" size={16} />
              </a>
              {profile.secondaryCtaHref?.startsWith("/") ? (
                <Link
                  className="button button-light"
                  href={profile.secondaryCtaHref}
                >
                  {profile.secondaryCtaText || "Explore My Projects"}
                </Link>
              ) : (
                <a
                  className="button button-light"
                  href={profile.secondaryCtaHref || "/projects"}
                  rel={
                    profile.secondaryCtaHref?.startsWith("http")
                      ? "noreferrer"
                      : undefined
                  }
                  target={
                    profile.secondaryCtaHref?.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                >
                  {profile.secondaryCtaText || "Explore My Projects"}
                </a>
              )}
              {content.resumeUrl ? (
                <a
                  className="button button-light"
                  download
                  href={content.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download résumé
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              ) : null}
            </div>
            {profile.socialLinks.length > 0 ? (
              <ul className="hero-social-links" aria-label="Social profiles">
                {profile.socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {social.label}
                      <ArrowUpRight aria-hidden="true" size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="hero-note" aria-label="Profile">
            <div className="hero-note-top">
              <span>Profile</span>
              <span>01 — 01</span>
            </div>
            {profile.avatarUrl && profile.avatarAlt ? (
              <div className="hero-image-frame">
                <Image
                  alt={profile.avatarAlt}
                  className="hero-image"
                  fill
                  priority
                  sizes="(max-width: 640px) 80vw, 34vw"
                  src={profile.avatarUrl}
                  unoptimized={!isOptimizablePortfolioImage(profile.avatarUrl)}
                />
              </div>
            ) : (
              <div
                aria-label={`${profile.name || "Portfolio"} profile image placeholder`}
                className="hero-monogram-frame"
                role="img"
              >
                <span className="monogram" aria-hidden="true">
                  {profile.name ? profile.name.charAt(0) : "M"}
                  <span>.</span>
                </span>
                <span className="profile-placeholder-label">
                  Profile portrait
                </span>
              </div>
            )}
            <div className="hero-note-bottom">
              <span>Data</span>
              <span>Ideas</span>
              <span>Digital</span>
            </div>
          </aside>

          <a className="scroll-cue" href="#about">
            <ArrowDown aria-hidden="true" size={15} />
            Scroll to explore
          </a>
        </section>

        {(profile.biography ||
          profile.professionalInterests.length > 0 ||
          profile.workingApproach.length > 0 ||
          content.education.length > 0) && (
          <section className="content-section about-section" id="about">
            <div className="section-shell">
              <div className="section-grid">
                <div className="section-heading">
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    A little about me
                  </p>
                  <h2>About</h2>
                </div>
                <div className="about-copy">
                  {profile.biography ? (
                    <p className="about-lead">{profile.biography}</p>
                  ) : null}
                  {profile.professionalInterests.length > 0 ? (
                    <div className="about-list-group">
                      <h3>Professional interests</h3>
                      <ul className="editorial-bullet-list">
                        {profile.professionalInterests.map((interest) => (
                          <li key={interest}>{interest}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {profile.workingApproach.length > 0 ? (
                    <div className="about-list-group">
                      <h3>Working approach</h3>
                      <ul className="editorial-bullet-list">
                        {profile.workingApproach.map((approach) => (
                          <li key={approach}>{approach}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {content.supplemental.interests.length > 0 ? (
                    <div className="about-list-group">
                      <h3>Outside technology</h3>
                      <ul className="editorial-bullet-list">
                        {content.supplemental.interests.map((interest) => (
                          <li key={interest}>{interest}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {content.education.length > 0 ? (
                    <div className="education-list">
                      <h3>Education</h3>
                      {content.education.map((education) => (
                        <article
                          className="education-item"
                          key={`${education.institution}-${education.qualification}`}
                        >
                          <GraduationCap
                            aria-hidden="true"
                            className="education-icon"
                            size={20}
                          />
                          <div>
                            <h4>
                              {education.qualification}
                              {education.fieldOfStudy
                                ? ` in ${education.fieldOfStudy}`
                                : ""}
                            </h4>
                            <p>{education.institution}</p>
                            {education.description ? (
                              <p>{education.description}</p>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {content.skillCategories.length > 0 ? (
          <section className="content-section skills-section" id="skills">
            <div className="section-shell">
              <div className="section-heading section-heading-wide">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    Tools & disciplines
                  </p>
                  <h2>Skills</h2>
                </div>
                <p className="section-aside">
                  Areas of practice, grouped by discipline.
                </p>
              </div>
              <div className="skill-category-grid">
                {content.skillCategories.map((category, categoryIndex) => (
                  <section
                    aria-labelledby={`skill-category-${categoryIndex}`}
                    className="skill-category"
                    key={category.name}
                  >
                    <div className="skill-category-heading">
                      <span className="skill-number">
                        {String(categoryIndex + 1).padStart(2, "0")}
                      </span>
                      <h3 id={`skill-category-${categoryIndex}`}>
                        {category.name}
                      </h3>
                    </div>
                    <ul>
                      {category.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.services.length > 0 ? (
          <section className="content-section services-section" id="services">
            <div className="section-shell">
              <div className="section-heading section-heading-wide">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    Ways I can help
                  </p>
                  <h2>Services</h2>
                </div>
                <p className="section-aside">
                  Practical support for thoughtful digital work.
                </p>
              </div>
              <div className="service-grid">
                {content.services.map((service, index) => (
                  <article className="service-card" key={service.slug}>
                    <span className="service-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    {service.deliverables.length > 0 ? (
                      <ul className="service-deliverables">
                        {service.deliverables.map((deliverable) => (
                          <li key={deliverable}>{deliverable}</li>
                        ))}
                      </ul>
                    ) : null}
                    {service.priceAmount !== null &&
                    service.priceCurrency ? (
                      <p className="service-price">
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: service.priceCurrency,
                        }).format(service.priceAmount)}
                      </p>
                    ) : null}
                    {service.availability ? (
                      <p className="service-availability">
                        {service.availability}
                      </p>
                    ) : null}
                    <Link
                      aria-label={`Discuss ${service.title}`}
                      className="service-discuss-link"
                      href={`/?service=${encodeURIComponent(service.slug)}#contact`}
                    >
                      Discuss this service
                      <ArrowUpRight aria-hidden="true" size={15} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="content-section projects-section" id="projects">
          <div className="section-shell">
            <div className="section-heading section-heading-wide">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow-line" />
                  Selected work
                </p>
                <h2>Projects</h2>
              </div>
              <Link className="text-link" href="/projects">
                Browse all projects
                <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
            </div>
            {content.projects.filter((project) => project.featured).length >
            0 ? (
              <div className="featured-project-grid">
                {content.projects
                  .filter((project) => project.featured)
                  .slice(0, 3)
                  .map((project, index) => (
                    <ProjectCard project={project} index={index} key={project.id} />
                  ))}
              </div>
            ) : (
              <div className="projects-empty">
                <span className="empty-mark" aria-hidden="true">
                  +
                </span>
                <div>
                  <h3>A space for selected work.</h3>
                  <p>Projects will appear here when they are ready to share.</p>
                </div>
                <span className="empty-index">SOON</span>
              </div>
            )}
          </div>
        </section>

        {content.supplemental.researchReferences.length > 0 ? (
          <section className="content-section experience-section" id="research">
            <div className="section-shell">
              <div className="section-heading section-heading-wide">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    Reference for review
                  </p>
                  <h2>Research</h2>
                </div>
              </div>
              <div className="experience-list">
                {content.supplemental.researchReferences.map((reference) => (
                  <article className="experience-item" key={reference.url}>
                    <div>
                      <h3>{reference.title}</h3>
                      {reference.venue || reference.publicationYear ? (
                        <p>
                          {[reference.venue, reference.publicationYear]
                            .filter((value) => value !== null && value !== undefined)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {reference.authors?.length ? (
                        <p>Authors: {reference.authors.join(", ")}</p>
                      ) : null}
                      {reference.authorContribution ? (
                        <p>{reference.authorContribution}</p>
                      ) : null}
                      {reference.doi ? <p>DOI: {reference.doi}</p> : null}
                      {reference.description ? (
                        <p>{reference.description}</p>
                      ) : null}
                    </div>
                    <p>
                      <a href={reference.url} rel="noreferrer" target="_blank">
                        View official record
                        <ArrowUpRight aria-hidden="true" size={13} />
                      </a>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.experience.length > 0 ||
        content.supplemental.teachingExperience.length > 0 ||
        content.supplemental.communityActivities.length > 0 ? (
          <section
            className="content-section experience-section"
            id="experience"
          >
            <div className="section-shell">
              <div className="section-heading section-heading-wide">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    Selected experience
                  </p>
                  <h2>Experience & Community</h2>
                </div>
              </div>
              {content.experience.length > 0 ? (
                <div className="experience-list">
                  {content.experience.map((item) => (
                    <article
                      className="experience-item"
                      key={`${item.role}-${item.organization}`}
                    >
                      <div>
                        <h3>{item.role}</h3>
                        {item.organization ? <p>{item.organization}</p> : null}
                        {item.description ? <p>{item.description}</p> : null}
                      </div>
                      <p className="experience-dates">
                        {item.periodLabel ||
                          (item.startDate || item.endDate || item.isCurrent
                            ? `${formatDate(item.startDate)}${
                                item.isCurrent
                                  ? " — Present"
                                  : item.endDate
                                    ? ` — ${formatDate(item.endDate)}`
                                    : ""
                              }`
                            : null)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}
              {content.supplemental.teachingExperience.length > 0 ? (
                <div className="experience-list">
                  <h3>Teaching</h3>
                  {content.supplemental.teachingExperience.map((item) => (
                    <article className="experience-item" key={item.title}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                      <p className="experience-dates">{item.period}</p>
                    </article>
                  ))}
                </div>
              ) : null}
              {content.supplemental.communityActivities.length > 0 ? (
                <div className="experience-list">
                  <h3>Leadership & Community</h3>
                  {content.supplemental.communityActivities.map((item) => (
                    <article
                      className="experience-item"
                      key={`${item.title}-${item.role}`}
                    >
                      <div>
                        <h4>{item.title}</h4>
                        <p>
                          {item.role}
                          {item.organization ? ` · ${item.organization}` : ""}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {content.certifications.length > 0 ||
        content.courses.length > 0 ||
        content.achievements.length > 0 ? (
          <section className="content-section credentials-section">
            <div className="section-shell">
              <div className="section-heading section-heading-wide">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-line" />
                    Learning & recognition
                  </p>
                  <h2>Coursework & credentials</h2>
                </div>
              </div>
              <div className="credentials-grid">
                {content.certifications.length > 0 ? (
                  <CredentialList
                    items={content.certifications.map((item) => ({
                      label: `${item.name} — ${item.issuer}`,
                      href: item.credentialUrl ?? undefined,
                    }))}
                    title="Certifications"
                  />
                ) : null}
                {content.courses.length > 0 ? (
                  <CredentialList
                    items={content.courses.map((label) => ({ label }))}
                    title="Relevant coursework"
                  />
                ) : null}
                {content.achievements.length > 0 ? (
                  <CredentialList
                    items={content.achievements.map((label) => ({ label }))}
                    title="Achievements"
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="contact-section" id="contact">
          <div className="section-shell contact-inner">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                Have something in mind?
              </p>
              <h2>Let&apos;s make something useful.</h2>
              <p className="contact-description">
                Have a question or an idea to discuss? I&apos;d be glad to hear
                from you.
              </p>
              {profile.email ? (
                <a className="contact-email" href={`mailto:${profile.email}`}>
                  {profile.email}
                  <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              ) : null}
              {profile.phone ? (
                <a className="contact-email" href={`tel:${profile.phone}`}>
                  {profile.phone}
                </a>
              ) : null}
              {profile.location ? (
                <p className="contact-location">{profile.location}</p>
              ) : null}
              {profile.socialLinks.length > 0 ? (
                <ul
                  className="contact-social-links"
                  aria-label="Social profiles"
                >
                  {profile.socialLinks.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {social.label}
                        <ArrowUpRight aria-hidden="true" size={13} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Suspense fallback={<p>Contact form loading…</p>}>
              <ContactForm
                enabled={contactFormEnabled}
                services={content.services.map(({ slug, title }) => ({
                  slug,
                  title,
                }))}
              />
            </Suspense>
          </div>
        </section>
      </main>

      <PortfolioFooter
        footerText={content.footerText}
        logoUrl={content.logoUrl}
        profile={profile}
        showAbout={Boolean(
          profile.biography ||
            profile.professionalInterests.length > 0 ||
            profile.workingApproach.length > 0 ||
            content.education.length > 0,
        )}
        showServices={content.services.length > 0}
      />
    </>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  return (
    <article className="project-card">
      <Link
        aria-label={`View ${project.title} project`}
        className="project-card-image"
        href={`/projects/${project.slug}`}
      >
        {project.thumbnailUrl && project.thumbnailAlt ? (
          <Image
            alt={project.thumbnailAlt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 32vw"
            src={project.thumbnailUrl}
            unoptimized={!isOptimizablePortfolioImage(project.thumbnailUrl)}
          />
        ) : (
          <span aria-hidden="true" className="project-image-placeholder">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span className="project-card-open">
          <ArrowUpRight aria-hidden="true" size={18} />
        </span>
      </Link>
      <div className="project-card-content">
        <div className="project-card-meta">
          {project.category ? <span>{project.category}</span> : null}
          <span>{project.tools.slice(0, 2).join(" · ")}</span>
        </div>
        <h3>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>
      </div>
    </article>
  );
}

function CredentialList({
  title,
  items,
}: {
  title: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <section className="credential-group">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a href={item.href} rel="noreferrer" target="_blank">
                {item.label}
                <ArrowUpRight aria-hidden="true" size={13} />
              </a>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}
