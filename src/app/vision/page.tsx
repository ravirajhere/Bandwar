import { getVisionData } from "@/lib/data";
import { PriorityCard } from "@/components/vision/PriorityCard";
import { Target, Trophy, Map, User, Calendar, IndianRupee, Crosshair } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vision 2035 | Bandwar Portal",
  description: "A non-political development manifesto for Bandwar village — 15 priorities, achievements, and a 10-year roadmap.",
};

export default function VisionPage() {
  const vision = getVisionData();

  return (
    <div className="bg-canvas min-h-screen pb-20 3xl:pb-32">
      
      {/* 🏛️ HERO SECTION (Formal Manifesto Header) */}
      <section className="relative bg-surface border-b border-divider pt-20 pb-16 3xl:pt-32 3xl:pb-24 mb-12 3xl:mb-20 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto px-4 md:px-0 relative z-10 text-center max-w-4xl">
          <span className="inline-flex items-center gap-2 bg-canvas border border-divider text-accent font-bold text-xs 3xl:text-sm uppercase tracking-widest px-4 py-1.5 rounded-md mb-6 shadow-sm">
            Official Village Manifesto
          </span>
          <h1 className="font-serif text-4xl md:text-6xl 3xl:text-7xl font-bold text-ink mb-6 leading-tight">
            Vision <span className="text-accent">2035</span>
          </h1>
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
            {vision.intro}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-0 max-w-5xl 3xl:max-w-6xl">
        
        {/* 🧭 Sticky Navigation (Formal Tabs) */}
        <nav className="sticky top-16 md:top-20 3xl:top-24 z-40 bg-canvas/90 backdrop-blur-md py-4 mb-12 3xl:mb-16 flex justify-center no-print">
          <div className="inline-flex bg-surface border border-divider rounded-lg p-1.5 shadow-sm overflow-x-auto">
            <a 
              href="#priorities" 
              className="px-5 py-2.5 rounded-md text-sm 3xl:text-base font-semibold text-ink/70 hover:text-ink hover:bg-canvas transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
            >
              <Target size={16} className="text-accent 3xl:w-5 3xl:h-5" /> 15 Priorities
            </a>
            <a 
              href="#achievements" 
              className="px-5 py-2.5 rounded-md text-sm 3xl:text-base font-semibold text-ink/70 hover:text-ink hover:bg-canvas transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
            >
              <Trophy size={16} className="text-accent 3xl:w-5 3xl:h-5" /> Achievements
            </a>
            <a 
              href="#roadmap" 
              className="px-5 py-2.5 rounded-md text-sm 3xl:text-base font-semibold text-ink/70 hover:text-ink hover:bg-canvas transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
            >
              <Map size={16} className="text-accent 3xl:w-5 3xl:h-5" /> Roadmap
            </a>
          </div>
        </nav>

        {/* 1. Priorities Section */}
        <section id="priorities" className="scroll-mt-32 mb-24 3xl:mb-32">
          <div className="flex items-center gap-4 mb-8 3xl:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <Target className="text-accent 3xl:w-8 3xl:h-8" /> The 15 Priorities
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="space-y-6 3xl:space-y-8">
            {vision.priorities.map((priority) => (
              <PriorityCard key={priority.id} data={priority} />
            ))}
          </div>
        </section>

        {/* 2. Achievements Section */}
        <section id="achievements" className="scroll-mt-32 mb-24 3xl:mb-32">
          <div className="flex items-center gap-4 mb-8 3xl:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <Trophy className="text-accent 3xl:w-8 3xl:h-8" /> Completed Achievements
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-8">
            {vision.achievements.map((ach: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-surface border border-divider p-6 md:p-8 3xl:p-10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="text-3xl 3xl:text-4xl mb-4">{ach.icon || "✅"}</div>
                
                <h3 className="font-serif font-bold text-ink text-xl 3xl:text-2xl mb-3">
                  {ach.title}
                </h3>
                
                <p className="text-ink/70 text-sm md:text-base 3xl:text-lg mb-6 leading-relaxed flex-grow">
                  {ach.description}
                </p>
                
                {/* Meta Data (Formal Tags) */}
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-divider">
                  {ach.by && (
                    <span className="inline-flex items-center gap-1.5 bg-canvas text-ink/70 text-xs 3xl:text-sm px-2.5 py-1.5 rounded-md font-medium border border-divider">
                      <User size={13} className="text-accent/70" /> {ach.by}
                    </span>
                  )}
                  {ach.date && (
                    <span className="inline-flex items-center gap-1.5 bg-canvas text-ink/70 text-xs 3xl:text-sm px-2.5 py-1.5 rounded-md font-medium border border-divider">
                      <Calendar size={13} className="text-accent/70" /> {ach.date}
                    </span>
                  )}
                  {ach.cost && (
                    <span className="inline-flex items-center gap-1.5 bg-canvas text-ink/70 text-xs 3xl:text-sm px-2.5 py-1.5 rounded-md font-medium border border-divider">
                      <IndianRupee size={13} className="text-accent/70" /> {ach.cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Roadmap Section (Vertical Timeline) */}
        <section id="roadmap" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8 3xl:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <Map className="text-accent 3xl:w-8 3xl:h-8" /> 10-Year Roadmap
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="relative border-l-2 border-divider ml-4 md:ml-6 space-y-12 3xl:space-y-16 pb-8">
            {vision.roadmap.map((phase: any, index: number) => (
              <div key={index} className="relative pl-8 md:pl-12">
                
                {/* Timeline Dot (Cut-out effect using canvas color) */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-accent border-4 border-canvas rounded-full shadow-sm"></div>
                
                {/* Phase Header */}
                <div className="mb-5">
                  <span className="text-accent font-bold text-xs md:text-sm tracking-wider uppercase mb-1.5 block">
                    Phase {phase.phase || phase.year} &middot; {phase.label || ""}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl 3xl:text-3xl font-semibold text-ink">
                    {phase.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-surface border border-divider text-ink/70 text-xs 3xl:text-sm px-3 py-1.5 rounded-md mt-3 font-medium shadow-sm">
                    <Crosshair size={14} className="text-accent" /> Focus: {phase.focus}
                  </div>
                </div>

                {/* Phase Items (Grid inside timeline) */}
                <div className="bg-surface border border-divider rounded-lg p-6 3xl:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 3xl:gap-y-8">
                    {phase.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="shrink-0 w-10 h-10 3xl:w-12 3xl:h-12 rounded-lg bg-canvas border border-divider flex items-center justify-center text-xl 3xl:text-2xl transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-ink text-base 3xl:text-lg mb-1 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-ink/70 text-sm 3xl:text-base leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}