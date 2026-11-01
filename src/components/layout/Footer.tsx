import Link from "next/link";
import { MasterConfig } from "@/lib/schema";
import { ArrowUp, Mail } from "lucide-react";
import { LiveWeatherWidget } from "@/components/shared/LiveWeatherWidget";

export function Footer({ config }: { config: MasterConfig }) {
  const currentYear = new Date().getFullYear();

  type FooterLink = { label: string; href: string };

  return (
    <footer className="bg-surface border-t border-divider mt-auto pt-12 md:pt-16 3xl:pt-24 pb-8 3xl:pb-12 relative no-print">
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 3xl:gap-16">
          
          {/* 1. Brand, Description & Contact (Takes 5 cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link 
              href="/" 
              className="font-serif text-2xl 3xl:text-4xl font-bold text-ink hover:text-accent transition-colors inline-block mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {config.site.name}
            </Link>
            <p className="text-sm md:text-base 3xl:text-lg text-ink/70 leading-relaxed mb-6 max-w-md">
              {config.site.description}
            </p>
            
            {/* Contact Info (Conditionally rendered if exists) */}
            {config.contact?.email && (
              <a 
                href={`mailto:${config.contact.email}`}
                className="inline-flex items-center gap-2 text-sm 3xl:text-base text-ink/60 hover:text-accent transition-colors font-medium mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm p-1 -ml-1"
              >
                <Mail size={16} className="3xl:w-5 3xl:h-5" />
                {config.contact.email}
              </a>
            )}
            
            <p className="text-sm 3xl:text-base text-ink/50 mt-2">
              {config.footer?.copyright?.replace("{year}", currentYear.toString()) || `© ${currentYear} ${config.site.name}. All rights reserved.`}
            </p>
          </div>

          {/* Spacer for Desktop */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* 2. Sections Links (Takes 3 cols on Desktop) */}
          <nav className="lg:col-span-3" aria-label="Footer Sections">
            <h4 className="font-serif text-base 3xl:text-xl font-semibold text-ink mb-4 3xl:mb-6">Sections</h4>
            <ul className="space-y-3 3xl:space-y-4">
              {config.footer?.sections?.map((link: FooterLink) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm 3xl:text-base text-ink/70 hover:text-accent transition-colors flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-divider group-hover:bg-accent transition-colors shrink-0"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 3. Explore Links (Takes 3 cols on Desktop) */}
          <nav className="lg:col-span-3" aria-label="Footer Explore">
            <h4 className="font-serif text-base 3xl:text-xl font-semibold text-ink mb-4 3xl:mb-6">Explore</h4>
            <ul className="space-y-3 3xl:space-y-4">
              {config.footer?.explore?.map((link: FooterLink) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm 3xl:text-base text-ink/70 hover:text-accent transition-colors flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-divider group-hover:bg-accent transition-colors shrink-0"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* 🌟 Bottom Bar (Clean, Legal & Structured) */}
        <div className="mt-12 md:mt-16 3xl:mt-24 pt-6 md:pt-8 border-t border-divider flex flex-col xl:flex-row items-center justify-between gap-6 text-sm text-ink/60">
          
          {/* Left Side: Credit & Weather */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full xl:w-auto justify-center xl:justify-start">
            <span className="font-medium text-center md:text-left">
              {config.footer?.credit || "Kept by the village, for the record"}
            </span>
            <span className="hidden md:block text-divider">|</span>
            <LiveWeatherWidget />
          </div>

          {/* Right Side: Legal Links & Back to Top */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-6 w-full xl:w-auto justify-center xl:justify-end">
            
            {/* Legal Links */}
            {config.footer?.legal && (
              <nav className="flex items-center gap-4 text-sm 3xl:text-base" aria-label="Legal">
                {config.footer.legal.map((link: FooterLink) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-1 px-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Back to Top */}
            <a 
              href="#top" 
              className="flex items-center gap-2 hover:text-accent transition-colors font-medium bg-canvas hover:bg-surface border border-divider px-5 py-2.5 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Back to top"
            >
              Back to top <ArrowUp size={16} className="3xl:w-5 3xl:h-5" />
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}