"use client";

import { initialProfile } from "@/lib/data";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0F0C20]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#06B6D4]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center z-10">
        {initialProfile.isAvailable && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16132B] border border-[#30294A] text-xs font-medium text-[#22C55E] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Available for Freelance & Full-time Roles
          </div>
        )}

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Turning Data Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#06B6D4]">Insights</span>, Ideas Into Digital Experiences.
        </h1>

        <p className="text-lg sm:text-xl font-medium text-[#EC4899] mb-4">
          {initialProfile.subtitle}
        </p>

        <p className="text-base sm:text-lg text-[#A7A3BC] max-w-2xl mx-auto mb-8 leading-relaxed">
          {initialProfile.bio}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8B5CF6] text-white font-semibold hover:bg-[#7C3AED] transition-all shadow-lg shadow-[#8B5CF6]/20"
          >
            Let&apos;s Work Together →
          </a>
          <a
            href="#projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16132B] border border-[#30294A] text-white font-semibold hover:border-[#8B5CF6] transition-all"
          >
            Explore My Projects
          </a>
        </div>

        <div className="flex items-center justify-center gap-5 text-[#A7A3BC]">
          {initialProfile.linkedin && (
            <a href={initialProfile.linkedin} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#16132B] border border-[#30294A] hover:text-[#8B5CF6] transition-all text-sm font-medium">
              LinkedIn
            </a>
          )}
          {initialProfile.email && (
            <a href={`mailto:${initialProfile.email}`} className="px-4 py-2 rounded-lg bg-[#16132B] border border-[#30294A] hover:text-[#8B5CF6] transition-all text-sm font-medium">
              Email
            </a>
          )}
          {initialProfile.github && (
            <a href={initialProfile.github} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#16132B] border border-[#30294A] hover:text-[#8B5CF6] transition-all text-sm font-medium">
              GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
}