import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-divider mt-auto py-8">
      <div className="container mx-auto px-4 md:px-0 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        
        {/* Col 1 */}
        <div className="col-span-1 md:col-span-2">
          <span className="font-serif font-bold text-ink text-lg block mb-2">Bandwar Village Archive</span>
          <p className="text-ink-muted leading-relaxed max-w-md">
            A community-driven, non-political digital archive of Bandwar village, Begusarai (Bihar). Preserving history, culture, and daily life for future generations.
          </p>
          <p className="text-ink-muted mt-4 text-xs">
            © {currentYear} Bandwar Village Community. Content licensed under CC BY-NC-SA 4.0.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-ink mb-3 uppercase tracking-wider text-xs">Sections</h4>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/section/history" className="hover:text-accent">History</Link></li>
            <li><Link href="/section/religion" className="hover:text-accent">Temples</Link></li>
            <li><Link href="/section/education" className="hover:text-accent">Education</Link></li>
            <li><Link href="/section/culture" className="hover:text-accent">Culture</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-ink mb-3 uppercase tracking-wider text-xs">Navigation</h4>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/about" className="hover:text-accent">About Portal</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-accent">Terms of Use</Link></li>
            <li><Link href="/about#license" className="hover:text-accent">License</Link></li>
            <li><Link href="/contribute" className="hover:text-accent font-semibold text-accent">Contribute</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}