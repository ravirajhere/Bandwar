import master from '../../../data/master.json';
import reachDataRaw from '../../../data/reach.json'; 
import { Navigation, MapPin, Compass } from "lucide-react";

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
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-[1200px]">
        
        {/* 🏛️ Page Header (Formal Archive Vibe) */}
        <div className="mb-10 md:mb-16">
          <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            How to Reach Bandwar
          </h1>
          
          {/* Decorative Accent Line */}
          <div className="w-16 md:w-20 h-1 bg-accent mb-6 rounded-full"></div>
          
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty max-w-3xl">
            {intro}
          </p>
        </div>

        {/* 📍 Travel Logistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-6 md:gap-8 3xl:gap-10">
          {options.length > 0 ? (
            options.map((opt, i) => (
              <div 
                key={i} 
                className="bg-surface border border-divider rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start"
              >
                {/* Icon Box */}
                <div 
                  className="w-12 h-12 3xl:w-16 3xl:h-16 bg-canvas border border-divider rounded-lg flex items-center justify-center text-2xl 3xl:text-3xl mb-6 shadow-sm shrink-0" 
                  aria-hidden="true"
                >
                  {opt.icon || <Navigation size={24} className="text-accent" />}
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="font-serif text-xl 3xl:text-2xl text-ink mb-3 font-semibold">
                    {opt.mode}
                  </h3>
                  <p className="text-[15px] md:text-base 3xl:text-lg text-ink/80 leading-relaxed">
                    {opt.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            /* 📭 Fallback UI */
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface border border-dashed border-divider rounded-lg text-center">
              <Compass size={48} className="text-ink/20 mb-4 3xl:w-16 3xl:h-16" />
              <h3 className="font-serif text-xl text-ink mb-2">Information Unavailable</h3>
              <p className="text-ink/60 text-sm md:text-base">
                Travel information is currently being updated. Please check back later.
              </p>
            </div>
          )}
        </div>

        {/* 🗺️ Optional Footer Note */}
        <div className="mt-12 pt-8 border-t border-divider flex items-center justify-center gap-2 text-sm md:text-base text-ink/50">
          <MapPin size={16} className="text-accent" />
          <span>Bandwar, Begusarai, Bihar — 851131</span>
        </div>

      </div>
    </div>
  );
}