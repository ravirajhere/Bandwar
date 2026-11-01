import { getMediaData } from "@/lib/data";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Timeline | Bandwar Portal",
  description: "A chronological history of Bandwar village from 600 BCE to the present day.",
};

export default function TimelinePage() {
  const media = getMediaData();
  
  // Sort timeline by sortKey
  const sortedTimeline = [...media.timeline].sort((a, b) => a.sortKey - b.sortKey);
  
  // Function to get era color
  const getEraColor = (eraId: string) => {
    const era = media.eras.find((e) => e.id === eraId);
    return era ? era.color : "#202122";
  };

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-[1200px]">
        
        {/* 🏛️ Page Header */}
        <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Clock size={32} className="3xl:w-10 3xl:h-10" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            The Village Timeline
          </h1>
          <div className="w-20 h-1 bg-accent mb-6 rounded-full mx-auto"></div>
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
            From the ancient Anga Mahajanapada to the digital age — a chronological record of Bandwar's history.
          </p>
        </div>

        {/* 📊 Era Legend (Formal Data Box) */}
        <div className="bg-surface border border-divider rounded-lg p-5 md:p-6 mb-12 3xl:mb-20 shadow-sm flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-4">
          {media.eras.map((era) => (
            <div key={era.id} className="flex items-center gap-2.5">
              <span className="w-3 h-3 3xl:w-4 3xl:h-4 rounded-sm border border-divider shadow-sm" style={{ backgroundColor: era.color }}></span>
              <div>
                <span className="font-bold text-[13px] 3xl:text-base block leading-none mb-1" style={{ color: era.color }}>{era.title}</span>
                <span className="text-[11px] 3xl:text-sm text-ink/50 font-medium">{era.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ⏳ Timeline Container */}
        <div className="max-w-5xl 3xl:max-w-6xl mx-auto relative pb-10">
          
          {/* Desktop Center Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-divider -translate-x-1/2"></div>
          
          {/* Mobile Left Line */}
          <div className="md:hidden absolute left-[11px] top-0 bottom-0 w-px bg-divider"></div>

          {sortedTimeline.map((event, index) => {
            const eraColor = getEraColor(event.era);
            const isEven = index % 2 === 0;

            return (
              <div 
                key={event.id} 
                className={`relative mb-8 md:mb-12 3xl:mb-16 w-full md:w-1/2 ${isEven ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"} pl-8 md:pl-0`}
              >
                
                {/* Timeline Marker (Square with canvas cut-out) */}
                <div 
                  className={`absolute top-6 w-3.5 h-3.5 3xl:w-4 3xl:h-4 border-[3px] border-canvas z-10 left-[5px] md:left-auto 
                    ${isEven ? "md:right-[-7px]" : "md:left-[-7px]"}`}
                  style={{ backgroundColor: eraColor }}
                ></div>

                {/* Content Card (Formal Archival Look) */}
                <div 
                  className={`bg-surface border border-divider p-5 sm:p-6 3xl:p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 group ${
                    isEven ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div className={`flex flex-wrap items-center gap-3 mb-3 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                    {event.icon && <span className="text-xl 3xl:text-2xl" aria-hidden="true">{event.icon}</span>}
                    <span className="text-[13px] 3xl:text-sm font-bold px-2.5 py-1 rounded-md border border-divider bg-canvas text-ink shadow-sm">
                      {event.year}
                    </span>
                    <span className="text-[11px] 3xl:text-xs uppercase tracking-wider font-bold" style={{ color: eraColor }}>
                      {event.era}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-lg md:text-xl 3xl:text-2xl font-bold text-ink mb-2 group-hover:text-accent transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm md:text-[15px] 3xl:text-base text-ink/70 leading-relaxed mb-4">
                    {event.description}
                  </p>
                  
                  {event.article && (
                    <Link 
                      href={`/article/${event.article}`}
                      className={`inline-flex items-center gap-1.5 text-accent text-[13px] 3xl:text-sm font-semibold hover:text-accent-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
                        isEven ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      Read full article <ArrowRight size={14} className={`3xl:w-4 3xl:h-4 ${isEven ? "md:rotate-180" : ""}`} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}