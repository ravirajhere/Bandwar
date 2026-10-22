import { getMasterData } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "About | Bandwar Portal",
  description: "Learn about the principles, sources, and community behind the Bandwar Village Portal.",
};

export default function AboutPage() {
  const config = getMasterData();
  const about = config.about;

  if (!about) return <div className="p-20 text-center text-wiki-text">About section missing in master.json</div>;

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            About the Portal
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed">
            {about.intro}
          </p>
        </div>

        <div className="space-y-10">
          
          {/* Story Section */}
          <section>
            <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
              Our Story
            </h2>
            <div className="space-y-3 text-[15px] text-wiki-text leading-relaxed">
              {about.story.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </section>

          {/* Principles Section */}
          <section>
            <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
              Our Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {about.principles.map((p, idx) => (
                <div key={idx} className="border border-wiki-border-light bg-wiki-bg-alt p-4 flex gap-3">
                  <div className="text-2xl" aria-hidden="true">{p.icon}</div>
                  <div>
                    <h3 className="font-bold text-wiki-text text-[15px] mb-1">{p.title}</h3>
                    <p className="text-[13px] text-wiki-text-muted leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sources Section */}
          <section>
            <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
              Sources & References
            </h2>
            <div className="border border-wiki-border-light bg-wiki-bg-alt">
              <ul className="divide-y divide-wiki-border-light">
                {about.sources.map((source, idx) => (
                  <li key={idx} className="p-3 hover:bg-wiki-bg transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-wiki-text-muted block mb-0.5">
                        {source.type}
                      </span>
                      <span className="font-bold text-wiki-link text-[14px]">
                        {source.name}
                      </span>
                    </div>
                    {source.detail && (
                      <span className="text-[13px] text-wiki-text-muted">
                        {source.detail}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Community & Committee Section */}
          <section className="border border-wiki-border-light bg-wiki-bg p-6">
            <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
              The Community
            </h2>
            <p className="text-[15px] text-wiki-text leading-relaxed mb-3">{about.community.lead}</p>
            <p className="text-[15px] text-wiki-text leading-relaxed mb-6">{about.community.contributors}</p>
            
            <h3 className="font-bold text-wiki-text text-[15px] mb-3">
              Editorial Committee
            </h3>
            <div className="flex flex-wrap gap-3">
              {about.committee.map((member, idx) => (
                <div key={idx} className="bg-wiki-bg-alt px-4 py-2 border border-wiki-border-light">
                  <span className="text-[11px] text-wiki-text-muted font-bold block mb-0.5 uppercase tracking-wide">
                    {member.role}
                  </span>
                  {member.link ? (
                    <a 
                      href={member.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-bold text-wiki-link text-[14px] hover:underline"
                    >
                      {member.name}
                    </a>
                  ) : (
                    <span className="font-bold text-wiki-text text-[14px]">{member.name}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}