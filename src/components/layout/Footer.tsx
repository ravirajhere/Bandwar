import Link from "next/link";
import { MasterConfig } from "@/lib/schema";
import { ArrowUp, Mail, Heart } from "lucide-react";
import { LiveWeatherWidget } from "@/components/shared/LiveWeatherWidget"; // 👈 Weather Widget Import kiya

export function Footer({ config }: { config: MasterConfig }) {
  const currentYear = new Date().getFullYear();

  type FooterLink = { label: string; href: string };

  return (
    <footer className="bg-card border-t border-border mt-auto pt-16 pb-8 relative no-print">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* 🏛️ Brand & Description (Takes up 2 columns on desktop) */}
          <div className="lg:col-span-2">
            <Link 
              href="/" 
              className="font-serif text-2xl font-bold text-foreground hover:text-brand transition-colors inline-block mb-4"
            >
              {config.site.name}
            </Link>
            <p className="text-base text-foreground/70 leading-relaxed mb-6 max-w-md">
              {config.site.description}
            </p>
            
            {/* Contact Info (From Schema) */}
            {config.contact?.email && (
              <a 
                href={`mailto:${config.contact.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors font-medium mb-4"
              >
                <Mail size={16} />
                {config.contact.email}
              </a>
            )}
            
            <p className="text-sm text-muted mt-2">
              {config.footer?.copyright?.replace("{year}", currentYear.toString()) || `© ${currentYear} ${config.site.name}. All rights reserved.`}
            </p>
          </div>

          {/* 🔗 Sections Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-5">Sections</h4>
            <ul className="space-y-3">
              {config.footer?.sections?.map((link: FooterLink) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-[15px] text-foreground/70 hover:text-brand transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-brand transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 🧭 Explore Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-5">Explore</h4>
            <ul className="space-y-3">
              {config.footer?.explore?.map((link: FooterLink) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-[15px] text-foreground/70 hover:text-brand transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-brand transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 🌟 Bottom Bar (Credits, Weather & Back to Top) */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-6 text-sm text-muted">
          
          {/* Left Side: Credit & Weather Widget */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span>{config.footer?.credit || "Bandwar Village Archive"}</span>
            
            {/* 👇 Weather Widget yahan integrate hai 👇 */}
            <LiveWeatherWidget />
          </div>
          
          {/* Right Side: Made with Love & Back to Top */}
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> by the Community
            </span>

            <a 
              href="#top" 
              className="flex items-center gap-2 hover:text-brand transition-colors font-medium bg-muted-background hover:bg-brand/10 px-4 py-2 rounded-full"
              aria-label="Back to top"
            >
              Back to top <ArrowUp size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}