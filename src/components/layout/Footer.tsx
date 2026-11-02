import Link from "next/link";
import { LiveWeatherWidget } from "@/components/shared/LiveWeatherWidget";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-divider mt-auto pt-12 3xl:pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Main Footer Grid (12-Column System) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          
          {/* Col 1: Brand & Identity (Spans 5 cols) */}
          <div className="md:col-span-12 lg:col-span-5">
            <Link href="/" className="font-serif font-bold text-ink text-xl 3xl:text-2xl block mb-3 hover:underline underline-offset-4 decoration-2">
              Bandwar Village Archive
            </Link>
            <p className="text-ink-muted leading-relaxed max-w-sm mb-4">
              A community-driven, non-political digital archive of Bandwar village, Begusarai (Bihar). Preserving history, culture, and daily life for future generations.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-ink-muted">
              <span>© {currentYear} Bandwar Community</span>
              <span className="w-1 h-1 rounded-full bg-divider"></span>
              <Link href="/about#license" className="hover:text-ink hover:underline underline-offset-4">
                CC BY-NC-SA 4.0
              </Link>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Col 2: Core Sections (Spans 2 cols) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Sections</h4>
            <ul className="space-y-2.5 text-ink-muted">
              <li><Link href="/section/history" className="hover:text-ink hover:underline underline-offset-4">History</Link></li>
              <li><Link href="/section/religion" className="hover:text-ink hover:underline underline-offset-4">Temples</Link></li>
              <li><Link href="/section/education" className="hover:text-ink hover:underline underline-offset-4">Education</Link></li>
              <li><Link href="/section/culture" className="hover:text-ink hover:underline underline-offset-4">Culture</Link></li>
              <li><Link href="/section/infrastructure" className="hover:text-ink hover:underline underline-offset-4">Infrastructure</Link></li>
            </ul>
          </div>

          {/* Col 3: Explore Portal (Spans 2 cols) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Explore</h4>
            <ul className="space-y-2.5 text-ink-muted">
              <li><Link href="/directory" className="hover:text-ink hover:underline underline-offset-4">Directory</Link></li>
              <li><Link href="/gallery" className="hover:text-ink hover:underline underline-offset-4">Gallery</Link></li>
              <li><Link href="/people" className="hover:text-ink hover:underline underline-offset-4">People</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & System (Spans 2 cols) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Information</h4>
            <ul className="space-y-2.5 text-ink-muted">
              <li><Link href="/about" className="hover:text-ink hover:underline underline-offset-4">About Portal</Link></li>
              <li><Link href="/contribute" className="hover:text-ink hover:underline underline-offset-4 font-medium text-accent">Get Involved</Link></li>
              <li><Link href="/privacy" className="hover:text-ink hover:underline underline-offset-4">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink hover:underline underline-offset-4">Terms of Use</Link></li>
              <li><Link href="/admin" className="hover:text-ink hover:underline underline-offset-4 text-ink/50">Editorial Login</Link></li>
            </ul>
          </div>
        </div>

        {/* 🛠️ Bottom Bar (Meta/Stripe Style) */}
        <div className="pt-6 border-t border-divider flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Weather & Location */}
          <div className="flex items-center gap-4 text-ink-muted text-xs order-2 md:order-1">
            <LiveWeatherWidget />
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-divider"></span>
            <span className="hidden sm:inline-block">Bandwar, Bihar, India</span>
          </div>

          {/* Right: Back to Top */}
          <div className="order-1 md:order-2">
            <a 
              href="#top" 
              className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors group"
            >
              Back to Top
              <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}