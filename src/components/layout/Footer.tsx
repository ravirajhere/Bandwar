import Link from "next/link";
import { MasterConfig } from "@/lib/schema";
import { Heart } from "lucide-react";

export function Footer({ config }: { config: MasterConfig }) {
  const currentYear = new Date().getFullYear();

  // Proper Type for Footer Links (No 'any')
  type FooterLink = { label: string; href: string };

  return (
    <footer className="bg-primary text-paper py-14 mt-20 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Brand & Description */}
        <div>
          <h3 className="font-serif text-2xl font-bold mb-4 text-white">{config.site.name}</h3>
          <p className="text-sm text-paper/60 leading-relaxed mb-6">
            {config.site.description}
          </p>
          <p className="text-xs text-paper/40 font-medium">
            {config.footer?.copyright?.replace("{year}", currentYear.toString()) || `© ${currentYear} ${config.site.name}`}
          </p>
        </div>

        {/* Quick Links (Sections) */}
        <div>
          <h4 className="font-bold text-warn mb-5 uppercase tracking-widest text-xs">Sections</h4>
          <ul className="space-y-3">
            {config.footer?.sections?.map((link: FooterLink) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="text-sm text-paper/70 hover:text-white hover:translate-x-1 inline-block transition-transform duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-bold text-warn mb-5 uppercase tracking-widest text-xs">Explore</h4>
          <ul className="space-y-3">
            {config.footer?.explore?.map((link: FooterLink) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="text-sm text-paper/70 hover:text-white hover:translate-x-1 inline-block transition-transform duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Credit Section */}
      <div className="max-w-6xl mx-auto px-4 mt-14 pt-6 border-t border-paper/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-paper/40">
        <span>{config.footer?.credit || "Bandwar Village Archive"}</span>
        <span className="flex items-center gap-1.5">
          Made with <Heart size={14} className="text-warn fill-warn" /> by the Community
        </span>
      </div>
    </footer>
  );
}