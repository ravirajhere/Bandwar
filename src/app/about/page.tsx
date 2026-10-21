import { getMasterData } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "About | Bandwar Archive",
  description: "Learn about the principles, sources, and community behind the Bandwar Village Archive.",
};

export default function AboutPage() {
  const config = getMasterData();
  const about = config.about;

  if (!about) return <div className="p-20 text-center">About section missing in master.json</div>;

  return (
    <div className="bg-[#f7f5ef] min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-[#1f3d2f] text-[#f7f5ef] py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">About the Archive</h1>
          <p className="text-lg md:text-xl text-[#f7f5ef]/80 leading-relaxed max-w-3xl mx-auto">
            {about.intro}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-20">
        
        {/* Story */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a18] mb-6">Our Story</h2>
          <div className="space-y-4 text-lg text-[#1a1a18]/80 leading-relaxed">
            {about.story.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a18] mb-8">Our Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {about.principles.map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#1a1a18]/10 shadow-sm flex gap-4">
                <div className="text-4xl">{p.icon}</div>
                <div>
                  <h3 className="font-bold text-[#1a1a18] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#1a1a18]/70 leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sources */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a18] mb-8">Sources & References</h2>
          <div className="bg-white rounded-2xl border border-[#1a1a18]/10 shadow-sm overflow-hidden">
            <ul className="divide-y divide-[#1a1a18]/10">
              {about.sources.map((source, idx) => (
                <li key={idx} className="p-4 hover:bg-[#f7f5ef] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#a64b2a] block mb-1">{source.type}</span>
                    <span className="font-medium text-[#1a1a18]">{source.name}</span>
                  </div>
                  {source.detail && <span className="text-sm text-[#1a1a18]/60">{source.detail}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Community & Committee */}
        <section className="bg-[#efece4] p-8 rounded-2xl border border-[#1a1a18]/10">
          <h2 className="font-serif text-2xl font-bold text-[#1a1a18] mb-4">The Community</h2>
          <p className="text-[#1a1a18]/80 mb-4">{about.community.lead}</p>
          <p className="text-[#1a1a18]/80 mb-8">{about.community.contributors}</p>
          
          <h3 className="font-bold text-[#1a1a18] uppercase tracking-wider text-sm mb-4">Editorial Committee</h3>
          <div className="flex flex-wrap gap-4">
            {about.committee.map((member, idx) => (
              <div key={idx} className="bg-white px-6 py-3 rounded-lg shadow-sm border border-[#1a1a18]/5">
                <span className="text-xs text-[#a64b2a] font-bold block mb-1">{member.role}</span>
                {member.link ? (
                  <a href={member.link} target="_blank" rel="noreferrer" className="font-bold text-[#1a1a18] hover:text-[#1f3d2f]">
                    {member.name}
                  </a>
                ) : (
                  <span className="font-bold text-[#1a1a18]">{member.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}