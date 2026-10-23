import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F0C20] text-[#F8FAFC]">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Services />
      <Contact />
      <footer className="py-8 text-center text-xs text-[#A7A3BC] border-t border-[#30294A]">
        © {new Date().getFullYear()} Mahmudul Hassan Masum. All rights reserved.
      </footer>
    </main>
  );
}