import Link from "next/link";
import { Contributor } from "@/lib/contributor";
import { User } from "lucide-react";

export function ContributorGrid({ contributors }: { contributors: Contributor[] }) {
  if (!contributors || contributors.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-divider">
      <h3 className="text-xs 3xl:text-sm font-bold text-ink/50 uppercase tracking-wider mb-6">
        Recent Contributors (Last 6 Months)
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {contributors.map((c) => (
          <Link
            key={c.id}
            href={`/contributors/${c.username}`}
            className="group bg-canvas border border-divider p-4 rounded-sm flex flex-col items-center text-center hover:border-accent/40 transition-all duration-200"
          >
            <div className="w-14 h-14 3xl:w-16 3xl:h-16 bg-surface border border-divider rounded-full flex items-center justify-center overflow-hidden mb-3 group-hover:border-accent/40 transition-colors">
              {c.photo ? (
                <img src={c.photo} alt={c.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-ink/20" />
              )}
            </div>
            
            <h4 className="font-serif font-bold text-ink text-sm 3xl:text-base leading-tight truncate w-full">
              {c.displayName}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}