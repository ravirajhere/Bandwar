import { getMediaData } from "@/lib/data";
import Link from "next/link";

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
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            The Village Timeline
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            From the ancient Anga Mahajanapada to the digital age — a chronological record of Bandwar's history.
          </p>
        </div>

        {/* Era Legend (Wikipedia Infobox Style) */}
        <div className="border border-wiki-border-light bg-wiki-bg-alt p-4 mb-12 flex flex-wrap gap-6">
          {media.eras.map((era) => (
            <div key={era.id} className="flex items-center gap-2">
              <span className="w-3 h-3 border border-wiki-border" style={{ backgroundColor: era.color }}></span>
              <div>
                <span className="font-bold text-[13px] block" style={{ color: era.color }}>{era.title}</span>
                <span className="text-[11px] text-wiki-text-muted">{era.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Container */}
        <div className="max-w-5xl mx-auto relative pb-10">
          
          {/* Desktop Center Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-wiki-border-light -translate-x-1/2"></div>
          
          {/* Mobile Left Line */}
          <div className="md:hidden absolute left-[11px] top-0 bottom-0 w-px bg-wiki-border-light"></div>

          {sortedTimeline.map((event, index) => {
            const eraColor = getEraColor(event.era);
            const isEven = index % 2 === 0;

            return (
              <div 
                key={event.id} 
                className={`relative mb-8 md:mb-12 w-full md:w-1/2 ${isEven ? "md:pr-10 md:ml-0" : "md:pl-10 md:ml-auto"} pl-8 md:pl-0`}
              >
                
                {/* Timeline Marker (Square for Wiki Look) */}
                <div 
                  className={`absolute top-4 w-3 h-3 border-2 border-wiki-bg z-10 left-[6px] md:left-auto 
                    ${isEven ? "md:right-[-6px]" : "md:left-[-6px]"}`}
                  style={{ backgroundColor: eraColor }}
                ></div>

                {/* Content Card (Sharp Borders, No Shadows) */}
                <div 
                  className={`bg-wiki-bg border border-wiki-border-light p-4 sm:p-5 hover:border-wiki-border transition-colors ${
                    isEven ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div className={`flex items-center gap-2 mb-2 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                    {event.icon && <span className="text-xl" aria-hidden="true">{event.icon}</span>}
                    <span className="text-[14px] font-bold px-2 py-0.5 border border-wiki-border-light bg-wiki-bg-alt text-wiki-text">
                      {event.year}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-bold" style={{ color: eraColor }}>
                      {event.era}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl text-wiki-text mb-2">
                    {event.title}
                  </h3>
                  <p className="text-[14px] text-wiki-text leading-relaxed mb-3">
                    {event.description}
                  </p>
                  
                  {event.article && (
                    <Link 
                      href={`/article/${event.article}`}
                      className="text-wiki-link text-[13px] font-bold hover:underline"
                    >
                      Read full article →
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