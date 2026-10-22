import { getVisionData } from "@/lib/data";
import { PriorityCard } from "@/components/vision/PriorityCard";

export const metadata = {
  title: "Vision 2035 | Bandwar Portal",
  description: "A non-political development manifesto for Bandwar village — 15 priorities, achievements, and a 10-year roadmap.",
};

export default function VisionPage() {
  const vision = getVisionData();

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            Vision 2035
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-4xl">
            {vision.intro}
          </p>
        </div>

        {/* Sticky Navigation (Wikipedia TOC Style) */}
        <nav className="sticky top-16 z-40 bg-wiki-bg-alt border border-wiki-border-light mb-8 flex overflow-x-auto shadow-sm">
          <a href="#priorities" className="px-4 py-3 text-[14px] font-bold text-wiki-text border-b-2 border-transparent hover:border-wiki-link hover:text-wiki-link whitespace-nowrap transition-colors">
            15 Priorities
          </a>
          <a href="#achievements" className="px-4 py-3 text-[14px] font-bold text-wiki-text border-b-2 border-transparent hover:border-wiki-link hover:text-wiki-link whitespace-nowrap transition-colors border-l border-wiki-border-light">
            Achievements
          </a>
          <a href="#roadmap" className="px-4 py-3 text-[14px] font-bold text-wiki-text border-b-2 border-transparent hover:border-wiki-link hover:text-wiki-link whitespace-nowrap transition-colors border-l border-wiki-border-light">
            10-Year Roadmap
          </a>
        </nav>

        {/* 1. Priorities Section */}
        <section id="priorities" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl text-wiki-text">The 15 Priorities</h2>
            <div className="h-px bg-wiki-border-light flex-grow"></div>
          </div>
          
          {vision.priorities.map((priority) => (
            <PriorityCard key={priority.id} data={priority} />
          ))}
        </section>

        {/* 2. Achievements Section */}
        <section id="achievements" className="scroll-mt-32 mt-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl text-wiki-text">Completed Achievements</h2>
            <div className="h-px bg-wiki-border-light flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vision.achievements.map((ach: any) => (
              <div key={ach.id} className="bg-wiki-bg-alt border border-wiki-border-light p-4 flex flex-col h-full">
                <div className="text-3xl mb-2">{ach.icon}</div>
                <h3 className="font-bold text-wiki-text text-[16px] mb-2">{ach.title}</h3>
                <p className="text-[14px] text-wiki-text-muted mb-4 flex-grow leading-relaxed">{ach.description}</p>
                <div className="border-t border-wiki-border-light pt-3 mt-auto text-[13px] text-wiki-text">
                  <p className="mb-1"><strong className="text-wiki-text-muted">By:</strong> {ach.by}</p>
                  <p className="mb-1"><strong className="text-wiki-text-muted">Date:</strong> {ach.date}</p>
                  <p><strong className="text-wiki-text-muted">Cost:</strong> {ach.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Roadmap Section */}
        <section id="roadmap" className="scroll-mt-32 mt-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl text-wiki-text">10-Year Roadmap</h2>
            <div className="h-px bg-wiki-border-light flex-grow"></div>
          </div>
          
          <div className="space-y-6">
            {vision.roadmap.map((phase: any) => (
              <div key={phase.phase} className="border border-wiki-border-light bg-wiki-bg">
                <div className="bg-[#eaecf0] border-b border-wiki-border-light p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="text-wiki-text-muted font-bold text-[11px] tracking-wider uppercase block mb-1">
                      Phase {phase.phase} · {phase.label}
                    </span>
                    <h3 className="font-bold text-wiki-text text-lg m-0">{phase.title}</h3>
                  </div>
                  <p className="text-[13px] text-wiki-text-muted bg-wiki-bg border border-wiki-border-light px-3 py-1.5 max-w-xs">
                    <strong>Focus:</strong> {phase.focus}
                  </p>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {phase.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-2xl mt-0.5">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-wiki-text text-[15px]">{item.title}</h4>
                        <p className="text-[14px] text-wiki-text-muted leading-relaxed mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}