import { getVisionData } from "@/lib/data";
import { PriorityCard } from "@/components/vision/PriorityCard";
import { Target, Trophy, Map, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vision 2035 | Bandwar Portal",
  description: "A non-political development manifesto for Bandwar village — 15 priorities, achievements, and a 10-year roadmap.",
};

export default function VisionPage() {
  const vision = getVisionData();

  return (
    <div className="bg-background min-h-screen pb-20">
      
      {/* 🏛️ HERO SECTION (Premium Header) */}
      <section className="relative bg-muted-background border-b border-border pt-20 pb-16 mb-12 overflow-hidden">
        {/* Background pattern/gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none"></div>
        
        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-block bg-brand/10 text-brand font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Village Manifesto
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Vision <span className="text-brand">2035</span>
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed">
            {vision.intro}
          </p>
        </div>
      </section>

      <div className="container-custom max-w-5xl">
        
        {/* 🧭 Sticky Navigation (Apple Style Pills) */}
        <nav className="sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 mb-12 flex justify-center no-print">
          <div className="inline-flex bg-card border border-border rounded-full p-1.5 shadow-sm">
            <a 
              href="#priorities" 
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-foreground hover:bg-muted-background transition-colors flex items-center gap-2"
            >
              <Target size={16} className="text-brand" /> 15 Priorities
            </a>
            <a 
              href="#achievements" 
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-foreground hover:bg-muted-background transition-colors flex items-center gap-2"
            >
              <Trophy size={16} className="text-brand" /> Achievements
            </a>
            <a 
              href="#roadmap" 
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-foreground hover:bg-muted-background transition-colors flex items-center gap-2"
            >
              <Map size={16} className="text-brand" /> Roadmap
            </a>
          </div>
        </nav>

        {/* 1. Priorities Section */}
        <section id="priorities" className="scroll-mt-32 mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <Target className="text-brand" size={28} /> The 15 Priorities
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            {vision.priorities.map((priority) => (
              /* Assuming PriorityCard is also updated to use new tokens */
              <PriorityCard key={priority.id} data={priority} />
            ))}
          </div>
        </section>

        {/* 2. Achievements Section */}
        <section id="achievements" className="scroll-mt-32 mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <Trophy className="text-brand" size={28} /> Completed Achievements
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vision.achievements.map((ach: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-elevated transition-all duration-300 group relative overflow-hidden"
              >
                {/* Decorative background icon */}
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">
                  {ach.icon || "🏆"}
                </div>

                <div className="text-4xl mb-4 relative z-10">{ach.icon || "✅"}</div>
                <h3 className="font-serif font-bold text-foreground text-xl mb-3 relative z-10">
                  {ach.title}
                </h3>
                <p className="text-muted text-sm mb-6 leading-relaxed relative z-10">
                  {ach.description}
                </p>
                
                {/* Meta Data */}
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border-subtle relative z-10">
                  {ach.by && (
                    <span className="bg-muted-background text-foreground/80 text-xs px-2.5 py-1 rounded-md font-medium">
                      👤 {ach.by}
                    </span>
                  )}
                  {ach.date && (
                    <span className="bg-brand/10 text-brand text-xs px-2.5 py-1 rounded-md font-medium">
                      📅 {ach.date}
                    </span>
                  )}
                  {ach.cost && (
                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-2.5 py-1 rounded-md font-medium">
                      💰 {ach.cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Roadmap Section (Vertical Timeline) */}
        <section id="roadmap" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <Map className="text-brand" size={28} /> 10-Year Roadmap
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="relative border-l-2 border-brand/20 ml-4 md:ml-6 space-y-12 pb-8">
            {vision.roadmap.map((phase: any, index: number) => (
              <div key={index} className="relative pl-8 md:pl-12">
                
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-brand border-4 border-background rounded-full shadow-sm"></div>
                
                {/* Phase Header */}
                <div className="mb-4">
                  <span className="text-brand font-bold text-sm tracking-wider uppercase mb-1 block">
                    Phase {phase.phase || phase.year} · {phase.label || ""}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-foreground">
                    {phase.title}
                  </h3>
                  <div className="inline-block bg-muted-background text-muted text-xs px-3 py-1.5 rounded-lg mt-2 font-medium">
                    🎯 Focus: {phase.focus}
                  </div>
                </div>

                {/* Phase Items (Grid inside timeline) */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {phase.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-muted-background flex items-center justify-center text-xl group-hover:bg-brand/10 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1">
                            {item.title}
                          </h4>
                          <p className="text-muted text-sm leading-relaxed">
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