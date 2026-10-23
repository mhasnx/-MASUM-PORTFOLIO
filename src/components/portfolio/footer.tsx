import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CurrentYear } from "@/components/ui/current-year";
import { isOptimizablePortfolioImage } from "@/lib/portfolio/image";
import type { PortfolioProfile } from "@/lib/portfolio/types";

export function PortfolioFooter({
  profile,
  footerText,
  logoUrl,
  showAbout,
  showServices,
}: {
  profile: PortfolioProfile;
  footerText: string | null;
  logoUrl?: string | null;
  showAbout: boolean;
  showServices: boolean;
}) {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-inner">
        <Link className="wordmark footer-wordmark" href="/#home">
          {logoUrl ? (
            <Image
              alt=""
              className="wordmark-logo"
              height={36}
              src={logoUrl}
              unoptimized={!isOptimizablePortfolioImage(logoUrl)}
              width={130}
            />
          ) : (
            <>
              Masum<span>.</span>
            </>
          )}
        </Link>
        {profile.name ? <p>{profile.name}</p> : null}
        {footerText ? <p>{footerText}</p> : null}
        <nav aria-label="Footer navigation" className="footer-quick-links">
          {showAbout ? <Link href="/#about">About</Link> : null}
          {showServices ? <Link href="/#services">Services</Link> : null}
          <Link href="/projects">Projects</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        {profile.email ? (
          <a className="footer-email" href={`mailto:${profile.email}`}>
            Email
            <ArrowUpRight aria-hidden="true" size={13} />
          </a>
        ) : null}
        {profile.socialLinks.map((social) => (
          <a
            className="footer-social-link"
            href={social.url}
            key={social.label}
            rel="noreferrer"
            target="_blank"
          >
            {social.label}
            <ArrowUpRight aria-hidden="true" size={13} />
          </a>
        ))}
        <Link className="back-to-top" href="/#home">
          Back to top ↑
        </Link>
        <span>
          © <CurrentYear />
        </span>
      </div>
    </footer>
  );
}
