import { getContributors } from "@/lib/data";
import Link from "next/link";
import { User, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Contributors | Bandwar Archive",
  description: "Meet the people who are preserving the history of Bandwar.",
};

export default function ContributorsPage() {
  const contributors = getContributors();

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-0 max-w-4xl">
        
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} className="text-divider" />
          <span className="text-ink font-medium">Contributors</span>
        </nav>

        <div className="border-b border-divider pb-6 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold">Our Contributors</h1>
          <p className="text-ink-muted mt-2">The volunteers and residents who are keeping this archive alive.</p>
        </div>

        {contributors.length === 0 ? (
          <div className="text-center py-20 text-ink-muted">No contributors yet. Be the first!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {contributors.map((c) => (
              <Link 
                key={c.id} 
                href={`/contributors/${c.username}`}
                className="flex items-center gap-4 bg-surface border border-divider p-4 rounded-sm hover:border-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-divider bg-canvas flex items-center justify-center shrink-0 overflow-hidden">
                  {c.photo ? (
                    <img src={c.photo} alt={c.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-ink/30" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-ink truncate">{c.displayName}</h3>
                  <p className="text-xs text-accent font-mono truncate">{c.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}