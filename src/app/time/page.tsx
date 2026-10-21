import { getMediaData } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "Timeline | Bandwar Archive",
  description: "A chronological history of Bandwar village from 600 BCE to the present day.",
};

export default function TimelinePage() {
  const media = getMediaData();
  
  // Timeline ko sortKey ke hisaab se sort kar rahe hain
  const sortedTimeline = [...media.timeline].sort((a, b) => a.sortKey - b.sortKey);
  
  // Era ke hisaab se color dhoondhne ka function
  const getEraColor = (eraId: string) => {
    const era = media.eras.find((e) => e.id === eraId);
    return era ? era.color : "#1a1a18";
  };

  return (
    <div className="bg-[#f7f5ef] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-[#1a1a18] text-[#f7f5ef] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            The Village Timeline
          </h1>
          <p className="text-lg md:text-xl text-[#f7f5ef]/80 leading-relaxed">
            From the ancient Anga Mahajanapada to the digital age — a chronological record of Bandwar's history.
          </p>
        </div>
      </section>

      {/* Era Legend */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-[#1a1a18]/10 p-6 flex flex-wrap justify-center gap-6">
          {media.eras.map((era) => (
            <div key={era.id} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: era.color }}></span>
              <div>
                <span className="font-bold text-sm block" style={{ color: era.color }}>{era.title}</span>
                <span className="text-xs text-[#1a1a18]/60">{era.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="max-w-4xl mx-auto px-4 mt-16 relative">
        
        {/* Desktop Center Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1a1a18]/10 -translate-x-1/2"></div>
        
        {/* Mobile Left Line */}
        <div className="md:hidden absolute left-[22px] top-0 bottom-0 w-0.5 bg-[#1a1a18]/10"></div>

        {sortedTimeline.map((event, index) => {
          const eraColor = getEraColor(event.era);
          const isEven = index % 2 === 0;

          return (
            <div 
              key={event.id} 
              className={`relative mb-8 md:mb-12 w-full md:w-1/2 ${isEven ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"} pl-14 md:pl-0`}
            >
              
              {/* Timeline Dot */}
              <div 
                className={`absolute top-6 w-4 h-4 rounded-full border-4 border-[#f7f5ef] z-10 left-[15px] md:left-auto 
                  ${isEven ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"}`}
                style={{ backgroundColor: eraColor }}
              ></div>

              {/* Content Card */}
              <div className={`bg-white p-6 rounded-xl border border-[#1a1a18]/10 shadow-sm hover:shadow-md transition-shadow ${isEven ? "md:text-right" : "md:text-left"}`}>
                <div className={`flex items-center gap-2 mb-2 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                  <span className="text-2xl">{event.icon}</span>
                  <span className="text-sm font-bold px-2 py-1 rounded bg-[#efece4] text-[#1a1a18]">
                    {event.year}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-bold" style={{ color: eraColor }}>
                    {event.era}
                  </span>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-[#1a1a18] mb-3">
                  {event.title}
                </h3>
                <p className="text-[#1a1a18]/80 text-sm leading-relaxed mb-4">
                  {event.description}
                </p>
                
                {event.article && (
                  <Link 
                    href={`/article/${event.article}`}
                    className="text-[#a64b2a] text-sm font-bold hover:underline"
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
  );
}