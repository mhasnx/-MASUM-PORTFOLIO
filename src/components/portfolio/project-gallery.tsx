"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { filterPortfolioProjects } from "@/lib/portfolio/filter-projects";
import { isOptimizablePortfolioImage } from "@/lib/portfolio/image";
import type { PortfolioProject } from "@/lib/portfolio/types";

type ProjectGalleryProps = {
  projects: PortfolioProject[];
};

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [projects],
  );
  const filteredProjects = useMemo(() => {
    return filterPortfolioProjects(projects, category, search);
  }, [category, projects, search]);

  if (projects.length === 0) {
    return (
      <div className="projects-empty projects-empty-large">
        <span className="empty-mark" aria-hidden="true">
          +
        </span>
        <div>
          <h2>No projects published yet.</h2>
          <p>Check back soon for selected work.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="project-controls">
        <div aria-label="Filter projects by category" className="project-filters" role="group">
          {["All", ...categories].map((option) => (
            <button
              aria-pressed={category === option}
              className={
                category === option ? "project-filter project-filter-active" : "project-filter"
              }
              key={option}
              onClick={() => setCategory(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <label className="project-search">
          <Search aria-hidden="true" size={16} />
          <span className="visually-hidden">Search projects</span>
          <input
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search projects"
            type="search"
            value={search}
          />
        </label>
      </div>

      {filteredProjects.length > 0 ? (
        <div aria-live="polite" className="project-gallery-grid">
          {filteredProjects.map((project, index) => (
            <article className="project-card" key={project.id}>
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
                  <span>{project.tools.join(" · ")}</span>
                </div>
                <h2>
                  <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                </h2>
                <p>{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="projects-empty projects-empty-large" aria-live="polite">
          <span className="empty-mark" aria-hidden="true">
            +
          </span>
          <div>
            <h2>No matching projects.</h2>
            <p>Try a different search or category.</p>
          </div>
          <button
            className="text-link"
            onClick={() => {
              setCategory("All");
              setSearch("");
            }}
            type="button"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
