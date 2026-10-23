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

  it("includes evidenced repositories and does not claim live deployments", () => {
    const { projects } = temporaryPortfolioFixtures;

    expect(projects.map((project) => project.sourceUrl)).toEqual([
      "https://github.com/mhasnx/basicdv",
      "https://github.com/mhasnx/lost-and-found-database-",
      "https://github.com/mhasnx/shieldlayer-waf",
    ]);
    expect(projects.every((project) => project.liveUrl === null)).toBe(true);
    expect(projects[0].tools).toEqual(["HTML", "CSS", "JavaScript"]);
    expect(projects[1].tools).toContain("PHP");
    expect(projects[2].description).toContain(
      "not been independently verified",
    );
  });

  it("marks pending education and publication details explicitly", () => {
    const content = temporaryPortfolioFixtures;

    expect(content.education[0].description).toContain(
      "official completion date pending confirmation",
    );
    expect(content.education[1].description).toContain("require confirmation");
    expect(content.supplemental.researchReferences).toEqual([
      {
        title: "Research reference",
        url: "https://ieeexplore.ieee.org/document/11490554",
        description:
          "Paper metadata, author list, author order, and individual contribution are awaiting verification.",
      },
    ]);
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
    expect(seed).toContain("https://github.com/mhasnx/basicdv");
    expect(seed).not.toMatch(/update\s+public\.skills/i);
    expect(seed).toContain("Bangla — Native");
    expect(seed).toContain("Expected completion in 2026");
  });
});
