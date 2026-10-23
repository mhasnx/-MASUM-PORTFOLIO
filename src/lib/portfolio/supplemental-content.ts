import type { SupplementalPortfolioContent } from "./types";

export const supplementalPortfolioContent = {
  researchReferences: [
    {
      title: "Research reference",
      url: "https://ieeexplore.ieee.org/document/11490554",
      description:
        "Paper metadata, author list, author order, and individual contribution are awaiting verification.",
    },
  ],
  teachingExperience: [
    {
      title: "Private Tutor — Classes 8–10",
      period: "2023–Present",
      description:
        "Teach Physics, Chemistry, Mathematics, Biology, and Computer Science. Prepare tailored lessons, explain difficult concepts, track progress, support exam preparation, and adapt to student needs.",
    },
    {
      title: "Private Tutor — HSC level",
      period: "2024–Present",
      description:
        "Teach ICT and core science subjects, with a focus on concept clarification, problem-solving, and exam preparation.",
    },
  ],
  communityActivities: [
    {
      title: "Cyber Security Club",
      role: "Member / participant",
      organization: "Uttara University",
    },
    {
      title: "Science Club",
      role: "Former Vice-President",
      organization: "KKFDM",
    },
    {
      title: "Bangladesh Rover Scouts",
      role: "Rover Mate",
      organization: null,
    },
    {
      title: "Blood Donor Society",
      role: "Active member",
      organization: null,
    },
    {
      title: "Event coordination",
      role: "Academic and cultural events",
      organization: null,
    },
  ],
  interests: ["Travel", "Football", "History", "Technology", "Learning new skills"],
} satisfies SupplementalPortfolioContent;
