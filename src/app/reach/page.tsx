import master from '../../../data/master.json';
// Direct JSON import (Next.js handles this perfectly during build)
import reachDataRaw from '../../../data/reach.json'; 

// 1. TypeScript Expert Approved: Strict Interface for Data
interface ReachOption {
  mode: string;
  details: string;
  icon: string | React.ReactNode; // Handles both emoji string and React icon
}

interface ReachData {
  intro?: string;
  options?: ReachOption[];
}

// Safe Casting of JSON data
const data: ReachData = reachDataRaw;

export const metadata = {
  title: `How to Reach | ${master.site.name}`,
  description: 'Travel guide on how to reach Bandwar village in Begusarai, Bihar by air, train, and road.',
};

export default function ReachPage() {
  // Safe fallback if options array is missing in JSON
  const options = data.options || [];
  const intro = data.intro || 'Detailed directions for visitors via Air, Train, and Road.';

  return (
    <div className="container-custom py-12 md:py-16">
      {/* Header Section */}
      <header className="mb-12 max-w-3xl">
        <span className="text-sm font-bold tracking-widest uppercase text-warn mb-2 block">
          Travel
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
          How to Reach Bandwar
        </h1>
        <p className="text-lg text-primary/70 leading-relaxed">
          {intro}
        </p>
      </header>

      {/* Options List */}
      <div className="max-w-3xl">
        {options.length > 0 ? (
          options.map((opt, i) => (
            <div 
              key={i} 
              className="flex gap-6 mb-10 pb-10 border-b border-primary/10 last:border-0 last:pb-0"
            >
              {/* Icon Container */}
              <div className="text-4xl shrink-0 mt-1">
                {opt.icon}
              </div>
              
              {/* Content */}
              <div>
                <h3 className="text-2xl font-serif font-semibold text-primary mb-2">
                  {opt.mode}
                </h3>
                <p className="text-primary/70 leading-relaxed">
                  {opt.details}
                </p>
              </div>
            </div>
          ))
        ) : (
          // Fallback UI if no options are found
          <div className="p-6 bg-surface rounded-xl border border-primary/10 text-center text-primary/60">
            Travel information is currently being updated. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}