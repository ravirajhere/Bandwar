import master from '../../../data/master.json';
import reachDataRaw from '../../../data/reach.json'; 

// 1. Strict Interfaces for Data
interface ReachOption {
  mode: string;
  details: string;
  icon: string; 
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
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            How to Reach Bandwar
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            {intro}
          </p>
        </div>

        {/* Options List (Wikipedia Article Style) */}
        <div className="max-w-3xl">
          {options.length > 0 ? (
            options.map((opt, i) => (
              <div 
                key={i} 
                className="flex gap-4 sm:gap-6 mb-6 pb-6 border-b border-wiki-border-light last:border-0 last:pb-0"
              >
                {/* Icon Container */}
                <div className="text-3xl shrink-0 mt-0.5" aria-hidden="true">
                  {opt.icon}
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="font-serif text-xl text-wiki-text mb-2">
                    {opt.mode}
                  </h3>
                  <p className="text-[15px] text-wiki-text leading-relaxed">
                    {opt.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Fallback UI if no options are found
            <div className="p-4 bg-wiki-bg-alt border border-wiki-border-light text-center text-wiki-text-muted text-[14px]">
              Travel information is currently being updated. Please check back later.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}