import { initialProfile } from "@/lib/data";
import { GraduationCap, Award, Briefcase } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#16132B]/50 border-y border-[#30294A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">About Me</h2>
          <div className="w-16 h-1 bg-[#8B5CF6] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Biography */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-white">
              Hi, I'm <span className="text-[#8B5CF6]">{initialProfile.name}</span>
            </h3>
            <p className="text-[#A7A3BC] text-base leading-relaxed">
              {initialProfile.bio}
            </p>
            <p className="text-[#A7A3BC] text-base leading-relaxed">
              Equipped with a solid foundation in Computer Science and Engineering, I bridge the gap between technical programming, structured data processing, and digital marketing strategies to deliver well-rounded digital solutions.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#1A1638] border border-[#30294A]">
                <p className="text-xs text-[#A7A3BC]">Location</p>
                <p className="text-sm font-semibold text-white mt-1">{initialProfile.location}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1638] border border-[#30294A]">
                <p className="text-xs text-[#A7A3BC]">Email</p>
                <p className="text-sm font-semibold text-white mt-1">{initialProfile.email}</p>
              </div>
            </div>
          </div>

          {/* Education & Overview Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#1A1638] border border-[#30294A] flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{initialProfile.education.degree}</h4>
                <p className="text-sm text-[#A7A3BC] mt-1">{initialProfile.education.institution}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1A1638] border border-[#30294A] flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#EC4899]/20 text-[#EC4899] shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Data & Web Solutions</h4>
                <p className="text-sm text-[#A7A3BC] mt-1">Specialized in Excel, Data Cleaning, Analytics, and SEO optimization.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1A1638] border border-[#30294A] flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#06B6D4]/20 text-[#06B6D4] shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Programming Skills</h4>
                <p className="text-sm text-[#A7A3BC] mt-1">Proficient in Python, C, C++, and core Networking basics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}