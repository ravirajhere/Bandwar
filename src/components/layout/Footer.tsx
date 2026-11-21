import Link from "next/link";
import { LiveWeatherWidget } from "@/components/shared/LiveWeatherWidget";
import { getAllArticles, getMasterData } from "@/lib/data";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const config = getMasterData();
  const allArticles = getAllArticles();
  const topArticles = [...allArticles]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 4);

  return (
    <footer className="bg-surface border-t border-divider mt-auto pt-12 3xl:pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-0">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">

          {/* Brand — 5 cols */}
          <div className="md:col-span-12 lg:col-span-4">
            <Link href="/" className="font-serif font-bold text-ink text-xl 3xl:text-2xl block mb-3 hover:text-accent transition-colors">
              Bandwar Village Archive
            </Link>
            <p className="text-ink-muted leading-relaxed max-w-sm mb-5">
              A community-driven, non-political digital archive of Bandwar village, Begusarai (Bihar). Preserving history, culture, and daily life for future generations.
            </p>

            {/* Newsletter — TOP TIER: Engagement */}
            <form
              action="/api/newsletter"
              method="post"
              className="max-w-sm"
              onSubmit={(e) => { e.preventDefault(); alert("Thank you! You will receive village updates."); }}
            >
              <label htmlFor="footer-newsletter" className="text-xs font-bold uppercase tracking-wider text-ink mb-2 block">
                Village Updates
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  placeholder="Your email"
                  className="input flex-1 !py-2"
                />
                <button type="submit" className="btn-primary !px-4 !py-2 shrink-0">
                  Join
                </button>
              </div>
              <p className="text-[11px] text-ink-subtle mt-2">One email a month. No spam.</p>
            </form>

            <div className="flex items-center gap-4 text-xs font-medium text-ink-muted mt-6">
              <span>© {currentYear} Bandwar Village Community</span>
              <span className="w-1 h-1 rounded-full bg-divider" aria-hidden="true"></span>
              <Link href="/about#license" className="hover:text-ink hover:underline underline-offset-4">
                CC BY-NC-SA 4.0
              </Link>
            </div>

            {/* Social — TOP TIER: Trust */}
            <div className="flex gap-3 mt-5">
              {config.social?.youtube && (
                <a href={config.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 flex items-center justify-center border border-divider rounded-full text-ink-muted hover:text-accent hover:border-accent transition-colors text-xs font-bold">YT</a>
              )}
              {config.social?.instagram && (
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center border border-divider rounded-full text-ink-muted hover:text-accent hover:border-accent transition-colors text-xs font-bold">IG</a>
              )}
              {config.social?.facebook && (
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center border border-divider rounded-full text-ink-muted hover:text-accent hover:border-accent transition-colors text-xs font-bold">FB</a>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Sections */}
          <nav className="md:col-span-4 lg:col-span-2" aria-label="Footer Sections">
            <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Sections</h4>
            <ul className="space-y-2.5 text-ink-muted">
              <li><Link href="/section/history" className="hover:text-accent hover:underline underline-offset-4">History</Link></li>
              <li><Link href="/section/religion" className="hover:text-accent hover:underline underline-offset-4">Temples</Link></li>
              <li><Link href="/section/education" className="hover:text-accent hover:underline underline-offset-4">Education</Link></li>
              <li><Link href="/section/culture" className="hover:text-accent hover:underline underline-offset-4">Culture</Link></li>
              <li><Link href="/section/infrastructure" className="hover:text-accent hover:underline underline-offset-4">Infrastructure</Link></li>
              <li><Link href="/section/landmarks" className="hover:text-accent hover:underline underline-offset-4">Landmarks</Link></li>
            </ul>
          </nav>

          {/* Explore */}
          <nav className="md:col-span-4 lg:col-span-2" aria-label="Footer Explore">
            <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Explore</h4>
            <ul className="space-y-2.5 text-ink-muted">
              <li><Link href="/directory" className="hover:text-accent hover:underline underline-offset-4">Directory</Link></li>
              <li><Link href="/gallery" className="hover:text-accent hover:underline underline-offset-4">Gallery</Link></li>
              <li><Link href="/map" className="hover:text-accent hover:underline underline-offset-4">Village Map</Link></li>
              <li><Link href="/people" className="hover:text-accent hover:underline underline-offset-4">People</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-accent hover:underline underline-offset-4">Sitemap</Link></li>
            </ul>
          </nav>

          {/* Information + Top Articles */}
          <div className="md:col-span-4 lg:col-span-3">
            <nav aria-label="Footer Information">
              <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Information</h4>
              <ul className="space-y-2.5 text-ink-muted mb-8">
                <li><Link href="/about" className="hover:text-accent hover:underline underline-offset-4">About Portal</Link></li>
                <li><Link href="/contribute" className="hover:text-accent hover:underline underline-offset-4 font-medium text-accent">Get Involved</Link></li>
                <li><Link href="/privacy" className="hover:text-accent hover:underline underline-offset-4">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-accent hover:underline underline-offset-4">Terms of Use</Link></li>
                <li><Link href="/admin" className="hover:text-accent hover:underline underline-offset-4 text-ink/50">Editorial Login</Link></li>
              </ul>
            </nav>

            {/* Top Articles — TOP TIER: Footer se bhi andar */}
            <div>
              <h4 className="font-bold text-ink mb-4 uppercase tracking-wider text-xs">Latest Stories</h4>
              <ul className="space-y-3">
                {topArticles.map((a) => (
                  <li key={a.id}>
                    <Link href={`/article/${a.id}`} className="group block">
                      <span className="text-sm text-ink leading-snug group-hover:text-accent transition-colors line-clamp-2 block">{a.title}</span>
                      <span className="text-[11px] text-ink-subtle">{new Date(a.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-divider flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-ink-muted text-xs order-2 md:order-1">
            <LiveWeatherWidget />
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-divider" aria-hidden="true"></span>
            <span className="hidden sm:inline-block">Bandwar, Bihar, India</span>
          </div>

          <div className="order-1 md:order-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="text-xs font-semibold text-ink-muted hover:text-accent flex items-center gap-1.5 transition-colors group"
            >
              Back to Top
              <span className="group-hover:-translate-y-0.5 transition-transform" aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}