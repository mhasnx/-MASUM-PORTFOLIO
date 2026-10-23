import { initialSkills } from "@/lib/data";

export default function Skills() {
  const categories = Array.from(new Set(initialSkills.map((s) => s.category)));

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F0C20]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Skills & Expertise</h2>
          <div className="w-16 h-1 bg-[#8B5CF6] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => {
            const filteredSkills = initialSkills.filter((s) => s.category === cat);

            return (
              <div key={cat} className="p-6 rounded-2xl bg-[#16132B] border border-[#30294A] hover:border-[#8B5CF6]/50 transition-all">
                <h3 className="text-xl font-bold text-[#8B5CF6] mb-5 border-b border-[#30294A] pb-3">
                  {cat}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {filteredSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1A1638] border border-[#30294A] text-sm text-[#F8FAFC] font-medium hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6] transition-all"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}