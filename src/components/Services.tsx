import { initialServices } from "@/lib/data";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

export default function Services() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#16132B]/50 border-t border-[#30294A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Services</h2>
          <p className="text-[#A7A3BC]">High-quality technical and administrative solutions tailored for your growth.</p>
          <div className="w-16 h-1 bg-[#8B5CF6] mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialServices.map((service, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#1A1638] border border-[#30294A] flex flex-col justify-between hover:border-[#8B5CF6] hover:scale-[1.02] transition-all group"
            >
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#8B5CF6] transition-colors mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-[#A7A3BC] mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6">
                  {service.deliverables.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-[#F8FAFC]">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-white transition-colors"
              >
                Discuss This Service <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}