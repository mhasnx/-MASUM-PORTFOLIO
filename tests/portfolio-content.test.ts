import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { temporaryPortfolioFixtures } from "../src/lib/portfolio/fixtures";

const seed = readFileSync(
  new URL("../supabase/seed.sql", import.meta.url),
  "utf8",
);

describe("integrated portfolio content", () => {
  it("uses the confirmed junior developer profile and contact links", () => {
    const { profile } = temporaryPortfolioFixtures;

    expect(profile.name).toBe("MD. Mahmudul Hassan");
    expect(profile.professionalTitle).toBe(
      "Junior Software Developer / Web Developer",
    );
    expect(profile.email).toBe("mahmudulhm73@gmail.com");
    expect(profile.phone).toBe("01747493376");
    expect(profile.avatarUrl).toBe("/Profile.png");
    expect(profile.avatarAlt).toBe("Portrait of MD. Mahmudul Hassan");
    expect(profile.socialLinks).toContainEqual({
      label: "GitHub",
      url: "https://github.com/mhasnx",
    });
  });

  it("includes evidenced repositories and the verified KrishiBazaar deployment", () => {
    const { projects } = temporaryPortfolioFixtures;

    expect(projects.map((project) => project.sourceUrl).filter(Boolean)).toEqual([
      "https://github.com/mhasnx/basicdv",
      "https://github.com/mhasnx/lost-and-found-database-",
      "https://github.com/mhasnx/shieldlayer-waf",
    ]);
    const krishiBazaar = projects.find((project) => project.slug === "krishibazaar");
    expect(krishiBazaar).toMatchObject({
      title: "KrishiBazaar",
      liveUrl: "https://krishibazaar-frontend.vercel.app",
      sourceUrl: null,
      tools: ["Next.js", "React", "Tailwind CSS"],
      thumbnailUrl: null,
    });
    expect(krishiBazaar?.description).toContain(
      "have not been independently verified",
    );
    expect(projects.find((project) => project.slug === "personal-portfolio-website")?.tools).toEqual(["HTML", "CSS", "JavaScript"]);
    expect(projects.find((project) => project.slug === "lost-and-found-database-system")?.tools).toContain("PHP");
    expect(projects.find((project) => project.slug === "shieldlayer-waf")?.description).toContain(
      "not been independently verified",
    );
  });

  it("marks pending education details and includes verified publication metadata", () => {
    const content = temporaryPortfolioFixtures;

    expect(content.education[0].description).toContain(
      "official completion date pending confirmation",
    );
    expect(content.education[1].description).toContain("require confirmation");
    expect(content.supplemental.researchReferences[0]).toMatchObject({
      title:
        "Reinforcement Learning for Optimizing Bowling Strategies in One Day Internationals",
      url: "https://ieeexplore.ieee.org/document/11490554",
      venue:
        "2025 28th International Conference on Computer and Information Technology (ICCIT)",
      publicationYear: 2025,
      doi: "10.1109/iccit68739.2025.11490554",
      authors: expect.arrayContaining(["Md. Mahmudul Hassan"]),
    });
    expect(content.supplemental.researchReferences[0].authors).toHaveLength(10);
  });

  it("does not add proficiency ratings and includes matching seed content", () => {
    expect(
      temporaryPortfolioFixtures.skillCategories
        .flatMap((category) => category.skills)
        .some((skill) => /%|proficien/i.test(skill)),
    ).toBe(false);
    expect(seed).toContain("'personal-portfolio-website'");
    expect(seed).toContain("'lost-and-found-database-system'");
    expect(seed).toContain("'shieldlayer-waf'");
    expect(seed).toContain("'krishibazaar'");
    expect(seed).toContain("https://krishibazaar-frontend.vercel.app");
    expect(seed).toContain(
      "Checkout and backend behavior have not been independently verified.",
    );
    expect(seed).toContain("https://github.com/mhasnx/basicdv");
    expect(seed).toContain(
      "Reinforcement Learning for Optimizing Bowling Strategies in One Day Internationals",
    );
    expect(seed).toContain("10.1109/iccit68739.2025.11490554");
    expect(seed).not.toMatch(/update\s+public\.skills/i);
    expect(seed).toContain("Bangla — Native");
    expect(seed).toContain("Expected completion in 2026");
  });
});
