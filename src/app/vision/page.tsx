import { getVisionData } from "@/lib/data";
import { PriorityCard } from "@/components/vision/PriorityCard";
import Image from "next/image";

export const metadata = {
  title: "Vision 2035 | Bandwar Archive",
  description: "A non-political development manifesto for Bandwar village — 15 priorities, achievements, and a 10-year roadmap.",
};

export default function VisionPage() {
  const vision = getVisionData();

  return (
    <div className="bg-[#f7f5ef] min-h-screen pb-20">
      
      {/* Hero Section */}
      <section className="bg-[#1f3d2f] text-[#f7f5ef] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#a64b2a] font-bold tracking-widest uppercase text-sm mb-4 block">
            A Community Manifesto
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Vision 2035
          </h1>
          <p className="text-lg md:text-xl text-[#f7f5ef]/80 leading-relaxed max-w-3xl mx-auto">
            {vision.intro}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Sticky Navigation */}
        <nav className="sticky top-16 z-40 bg-white border border-[#1a1a18]/10 rounded-xl shadow-md p-2 flex justify-center gap-2 mb-12">
          <a href="#priorities" className="px-4 py-2 text-sm font-bold text-[#1a1a18] hover:bg-[#efece4] rounded-lg transition-colors">15 Priorities</a>
          <a href="#achievements" className="px-4 py-2 text-sm font-bold text-[#1a1a18] hover:bg-[#efece4] rounded-lg transition-colors">Achievements</a>
          <a href="#roadmap" className="px-4 py-2 text-sm font-bold text-[#1a1a18] hover:bg-[#efece4] rounded-lg transition-colors">10-Year Roadmap</a>
        </nav>

        {/* 1. Priorities Section */}
        <section id="priorities" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1a1a18]">The 15 Priorities</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
          </div>
          
          {vision.priorities.map((priority) => (
            <PriorityCard key={priority.id} data={priority} />
          ))}
        </section>

        {/* 2. Achievements Section */}
        <section id="achievements" className="scroll-mt-32 mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1a1a18]">Completed Achievements</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vision.achievements.map((ach) => (
              <div key={ach.id} className="bg-white p-6 rounded-2xl border border-[#1a1a18]/10 shadow-sm flex flex-col h-full">
                <div className="text-4xl mb-4">{ach.icon}</div>
                <h3 className="font-serif text-xl font-bold text-[#1a1a18] mb-2">{ach.title}</h3>
                <p className="text-sm text-[#1a1a18]/70 mb-4 flex-grow">{ach.description}</p>
                <div className="border-t border-[#1a1a18]/10 pt-4 mt-auto">
                  <p className="text-sm"><strong>By:</strong> {ach.by}</p>
                  <p className="text-sm"><strong>Date:</strong> {ach.date}</p>
                  <p className="text-sm"><strong>Cost:</strong> {ach.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Roadmap Section */}
        <section id="roadmap" className="scroll-mt-32 mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1a1a18]">10-Year Roadmap</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
          </div>
          
          <div className="space-y-8">
            {vision.roadmap.map((phase) => (
              <div key={phase.phase} className="bg-white border border-[#1a1a18]/10 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[#1a1a18]/10 gap-4">
                  <div>
                    <span className="text-[#a64b2a] font-bold text-sm tracking-widest uppercase block mb-1">
                      Phase {phase.phase} · {phase.label}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#1a1a18]">{phase.title}</h3>
                  </div>
                  <p className="text-sm text-[#1a1a18]/60 bg-[#efece4] px-4 py-2 rounded-lg max-w-xs md:text-right">
                    <strong>Focus:</strong> {phase.focus}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-[#1a1a18]">{item.title}</h4>
                        <p className="text-sm text-[#1a1a18]/70">{item.description}</p>
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