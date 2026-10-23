"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isOptimizablePortfolioImage } from "@/lib/portfolio/image";

type PortfolioNavigationProps = {
  showExperience: boolean;
  showAbout: boolean;
  showSkills: boolean;
  showServices: boolean;
  showResearch: boolean;
  showTestimonials: boolean;
  logoUrl?: string | null;
  themeDefault?: "light" | "dark" | "system";
};

export function PortfolioNavigation({
  showExperience,
  showAbout,
  showSkills,
  showServices,
  showResearch,
  showTestimonials,
  logoUrl = null,
  themeDefault = "system",
}: PortfolioNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const navigation = useMemo(
    () => [
      { label: "Home", href: "/#home", id: "home" },
      ...(showAbout ? [{ label: "About", href: "/#about", id: "about" }] : []),
      ...(showSkills ? [{ label: "Skills", href: "/#skills", id: "skills" }] : []),
      ...(showServices
        ? [{ label: "Services", href: "/#services", id: "services" }]
        : []),
      {
        label: "Projects",
        href: pathname === "/" ? "/#projects" : "/projects",
        id: "projects",
      },
      ...(showResearch
        ? [{ label: "Research", href: "/#research", id: "research" }]
        : []),
      ...(showTestimonials
        ? [{ label: "Testimonials", href: "/#testimonials", id: "testimonials" }]
        : []),
      ...(showExperience
        ? [{ label: "Experience", href: "/#experience", id: "experience" }]
        : []),
      { label: "Contact", href: "/#contact", id: "contact" },
    ],
    [
      pathname,
      showAbout,
      showExperience,
      showResearch,
      showServices,
      showSkills,
      showTestimonials,
    ],
  );

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (!("IntersectionObserver" in window) || sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const currentSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (currentSection) {
          setActiveSection(currentSection.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navigation, pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuToggleRef.current?.focus();
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/#home" aria-label="Masum, home">
          {logoUrl ? (
            <Image
              alt=""
              className="wordmark-logo"
              height={40}
              src={logoUrl}
              unoptimized={!isOptimizablePortfolioImage(logoUrl)}
              width={150}
            />
          ) : (
            <>
              Masum<span>.</span>
            </>
          )}
        </Link>
        <button
          aria-controls="portfolio-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="mobile-menu-toggle"
          ref={menuToggleRef}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? (
            <X aria-hidden="true" size={20} />
          ) : (
            <Menu aria-hidden="true" size={20} />
          )}
        </button>
        <nav
          aria-label="Main navigation"
          className={`main-nav${menuOpen ? " main-nav-open" : ""}`}
          id="portfolio-navigation"
        >
          {navigation.map((item) => (
            <Link
              aria-current={
                pathname === "/" && activeSection === item.id
                  ? "location"
                  : item.id === "projects" && pathname.startsWith("/projects")
                    ? "page"
                    : undefined
              }
              className={
                (pathname === "/" && activeSection === item.id) ||
                (item.id === "projects" && pathname.startsWith("/projects"))
                  ? "main-nav-link-active"
                  : undefined
              }
              href={item.href}
              key={item.id}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle defaultTheme={themeDefault} />
          <Link className="header-contact" href="/#contact" onClick={closeMenu}>
            Let&apos;s Talk <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
