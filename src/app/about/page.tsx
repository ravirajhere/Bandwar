import { getMasterData } from "@/lib/data";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Heart,
  Quote,
  Scale,
  Lock,
  Code2
} from "lucide-react";

export const metadata = {
  title: "About | Bandwar Portal",
  description: "Learn about the principles, sources, and community behind the Bandwar Village Portal.",
};

export default function AboutPage() {
  const config = getMasterData();
  const about = config.about;

  if (!about) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-ink/60">
        About section missing in master.json
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen pb-20 3xl:pb-32">
      
      {/* 🏛️ HERO SECTION */}
      <section className="bg-surface border-b border-divider pt-20 pb-16 3xl:pt-32 3xl:pb-24 mb-12 3xl:mb-20">
        <div className="container mx-auto px-4 md:px-0 max-w-4xl 3xl:max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 bg-canvas border border-divider text-accent font-bold text-xs 3xl:text-sm uppercase tracking-widest px-4 py-1.5 rounded-md mb-6 shadow-sm">
            <ShieldCheck size={14} className="3xl:w-4 3xl:h-4" /> Official Portal
          </span>
          <h1 className="font-serif text-4xl md:text-6xl 3xl:text-7xl font-bold text-ink mb-6 tracking-tight">
            About the Portal
          </h1>
          <p className="text-base md:text-xl 3xl:text-2xl text-ink/80 leading-relaxed max-w-3xl mx-auto text-pretty">
            {about.intro}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-0 max-w-5xl 3xl:max-w-6xl space-y-16 md:space-y-24">
        
        {/* 📖 STORY SECTION */}
        <section className="max-w-3xl 3xl:max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8 3xl:mb-10">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <BookOpen className="text-accent 3xl:w-8 3xl:h-8" size={28} /> Our Story
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-ink/80 leading-loose 3xl:prose-xl">
            {about.story.map((p, idx) => (
              <p key={idx} className="mb-6 3xl:mb-8">{p}</p>
            ))}
          </div>
        </section>

        {/* 🛡️ PRINCIPLES SECTION */}
        <section>
          <div className="flex items-center gap-4 mb-8 3xl:mb-10">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <ShieldCheck className="text-accent 3xl:w-8 3xl:h-8" size={28} /> Our Principles
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 3xl:gap-8">
            {about.principles.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-surface border border-divider p-6 3xl:p-8 rounded-lg shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider rounded-lg flex items-center justify-center text-2xl 3xl:text-3xl mb-5">
                  {p.icon}
                </div>
                <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">
                  {p.title}
                </h3>
                <p className="text-ink/70 text-sm 3xl:text-base leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 📚 SOURCES SECTION */}
        <section>
          <div className="flex items-center gap-4 mb-8 3xl:mb-10">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <FileText className="text-accent 3xl:w-8 3xl:h-8" size={28} /> Sources & References
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="bg-surface border border-divider rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-divider">
              {about.sources.map((source, idx) => (
                <li 
                  key={idx} 
                  className="p-5 3xl:p-6 hover:bg-canvas transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent/40 block"></span>
                    </div>
                    <div>
                      <span className="text-[11px] 3xl:text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
                        {source.type}
                      </span>
                      <span className="font-semibold text-ink text-base 3xl:text-lg">
                        {source.name}
                      </span>
                    </div>
                  </div>
                  
                  {source.detail && (
                    <span className="text-sm 3xl:text-base text-ink/60 bg-canvas border border-divider px-3 py-1.5 rounded-md whitespace-nowrap">
                      {source.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 👥 COMMUNITY & COMMITTEE SECTION */}
        <section className="bg-surface border border-divider rounded-lg p-8 md:p-12 3xl:p-16 shadow-sm relative overflow-hidden">
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 3xl:mb-10">
              <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
                <Users className="text-accent 3xl:w-8 3xl:h-8" size={28} /> The Community
              </h2>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-ink/80 mb-10">
              <blockquote className="border-l-4 border-accent pl-5 not-italic font-medium text-ink text-lg md:text-xl 3xl:text-2xl leading-relaxed m-0 bg-canvas py-3 pr-4 rounded-r-md">
                {about.community.lead}
              </blockquote>
              <p className="mt-6 text-sm md:text-base 3xl:text-lg">{about.community.contributors}</p>
            </div>
            
            <div className="border-t border-divider pt-8">
              <h3 className="text-xs 3xl:text-sm font-bold text-ink/50 uppercase tracking-wider mb-6">
                Editorial Committee
              </h3>
              <div className="flex flex-wrap gap-4">
                {about.committee.map((member, idx) => (
                  <div 
                    key={idx} 
                    className="bg-canvas border border-divider px-5 py-4 rounded-lg flex items-center gap-4 hover:border-accent/40 transition-colors"
                  >
                    <div className="w-10 h-10 3xl:w-12 3xl:h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold text-lg 3xl:text-xl">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[11px] 3xl:text-xs text-ink/50 font-bold block mb-0.5 uppercase tracking-wide">
                        {member.role}
                      </span>
                      {member.link ? (
                        <a 
                          href={member.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-ink hover:text-accent transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                        >
                          {member.name} <ExternalLink size={12} className="3xl:w-4 3xl:h-4" />
                        </a>
                      ) : (
                        <span className="font-bold text-ink">{member.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 📜 LICENSE SECTION (Required by footer link: /about#license) */}
        <section id="license" className="scroll-mt-28">
          <div className="flex items-center gap-4 mb-8 3xl:mb-10">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <Scale className="text-accent 3xl:w-8 3xl:h-8" size={28} /> Content & Code License
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>

          <div className="bg-surface border border-divider rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 3xl:p-10 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="shrink-0 w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider rounded-lg flex items-center justify-center">
                  <Lock size={22} className="text-accent 3xl:w-7 3xl:h-7" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">
                    Content License — CC BY-NC-SA 4.0
                  </h3>
                  <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                    All articles, photographs, and historical documents published on this portal are licensed under the <strong className="text-ink">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</strong>. You are free to share and adapt the content for non-commercial purposes, provided you give appropriate credit to the portal and its contributors, and distribute your contributions under the same license.
                  </p>
                  <a 
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover text-sm font-medium mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    View License Terms <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-6 border-t border-divider">
                <div className="shrink-0 w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider rounded-lg flex items-center justify-center">
                  <Code2 size={22} className="text-accent 3xl:w-7 3xl:h-7" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">
                    Code License — MIT
                  </h3>
                  <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                    The underlying source code of this portal is open source and licensed under the <strong className="text-ink">MIT License</strong>. Developers are free to use, modify, and distribute the code to build similar community archives for their own villages.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-divider">
                <p className="text-ink/60 text-xs md:text-sm 3xl:text-base italic leading-relaxed">
                  For commercial use, republication, or any queries regarding content usage, please contact the editorial team via the <Link href="/contribute" className="text-accent hover:underline not-italic font-medium">Contribute page</Link>.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 🚀 CTA SECTION */}
        <section className="text-center py-12 3xl:py-20">
          <div className="w-14 h-14 3xl:w-16 3xl:h-16 bg-surface border border-divider rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Heart className="text-red-500 3xl:w-8 3xl:h-8" size={26} />
          </div>
          <h3 className="font-serif text-xl md:text-2xl 3xl:text-3xl font-bold text-ink mb-3">
            Want to contribute to this archive?
          </h3>
          <p className="text-ink/60 text-sm md:text-base 3xl:text-lg mb-8 max-w-md mx-auto">
            This portal belongs to the people of Bandwar. Help us preserve our history and culture.
          </p>
          <Link 
            href="/contribute" 
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Go to Contribute Page
          </Link>
        </section>

      </div>
    </div>
  );
}