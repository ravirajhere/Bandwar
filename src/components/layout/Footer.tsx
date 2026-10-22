import Link from "next/link";
import { MasterConfig } from "@/lib/schema";

export function Footer({ config }: { config: MasterConfig }) {
  const currentYear = new Date().getFullYear();

  type FooterLink = { label: string; href: string };

  return (
    // Wikipedia Style: Light grey background, thin top border
    <footer className="bg-wiki-bg-alt border-t border-wiki-border-light mt-12 py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Description (Takes up 2 columns on desktop) */}
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl font-bold mb-3 text-wiki-text">{config.site.name}</h3>
          <p className="text-[13px] text-wiki-text-muted leading-relaxed mb-4 max-w-md">
            {config.site.description}
          </p>
          <p className="text-xs text-wiki-text-muted">
            {config.footer?.copyright?.replace("{year}", currentYear.toString()) || `© ${currentYear} ${config.site.name}`}
          </p>
        </div>

        {/* Quick Links (Sections) */}
        <div>
          <h4 className="font-bold text-wiki-text mb-3 text-sm">Sections</h4>
          <ul className="space-y-2">
            {config.footer?.sections?.map((link: FooterLink) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="text-[13px] text-wiki-link hover:underline focus:outline-none focus:ring-1 focus:ring-wiki-link rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-bold text-wiki-text mb-3 text-sm">Explore</h4>
          <ul className="space-y-2">
            {config.footer?.explore?.map((link: FooterLink) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="text-[13px] text-wiki-link hover:underline focus:outline-none focus:ring-1 focus:ring-wiki-link rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Credit Section */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 mt-10 pt-4 border-t border-wiki-border-light flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-wiki-text-muted">
        <span>{config.footer?.credit || "Bandwar Village Archive"}</span>
        <span className="flex items-center gap-1">
          Made with <span className="text-red-500 text-sm">♥</span> by the Community
        </span>
      </div>
    </footer>
  );
}