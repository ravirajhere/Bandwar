import Link from "next/link";
import { MasterConfig } from "@/lib/schema";

export function Footer({ config }: { config: MasterConfig }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a18] text-[#f7f5ef] py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand & Description */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-4">{config.site.name}</h3>
          <p className="text-sm text-[#f7f5ef]/60 leading-relaxed mb-6">
            {config.site.description}
          </p>
          <p className="text-sm text-[#f7f5ef]/40">
            {config.footer?.copyright?.replace("{year}", currentYear.toString()) || `© ${currentYear} ${config.site.name}`}
          </p>
        </div>

        {/* Quick Links (Sections) */}
        <div>
          <h4 className="font-bold text-[#a64b2a] mb-4 uppercase tracking-wider text-sm">Sections</h4>
          <ul className="space-y-2">
            {/* 👇 Yahan 'link: any, idx: number' add kar diya hai */}
            {config.footer?.sections?.map((link: any, idx: number) => (
              <li key={idx}>
                <Link href={link.href} className="text-sm text-[#f7f5ef]/70 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-bold text-[#a64b2a] mb-4 uppercase tracking-wider text-sm">Explore</h4>
          <ul className="space-y-2">
            {/* 👇 Yahan bhi 'link: any, idx: number' add kar diya hai */}
            {config.footer?.explore?.map((link: any, idx: number) => (
              <li key={idx}>
                <Link href={link.href} className="text-sm text-[#f7f5ef]/70 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
      
      {/* Credit */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-[#f7f5ef]/10 text-center text-xs text-[#f7f5ef]/40">
        {config.footer?.credit || `Made with ❤️ by Ravi Raj`}
      </div>
    </footer>
  );
}