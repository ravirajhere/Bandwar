import { getMasterData } from "@/lib/data";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Heart,
  Quote
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
      <div className="min-h-screen flex items-center justify-center bg-background text-muted">
        About section missing in master.json
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      
      {/* 🏛️ HERO SECTION */}
      <section className="bg-muted-background border-b border-border pt-20 pb-16 mb-12">
        <div className="container-custom max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 bg-brand/10 text-brand font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck size={14} /> Our Identity
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            About the Portal
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
            {about.intro}
          </p>
        </div>
      </section>

      <div className="container-custom max-w-5xl space-y-20">
        
        {/* 📖 STORY SECTION */}
        <section className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <BookOpen className="text-brand" size={28} /> Our Story
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-loose">
            {about.story.map((p, idx) => (
              <p key={idx} className="mb-6">{p}</p>
            ))}
          </div>
        </section>

        {/* 🛡️ PRINCIPLES SECTION */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <ShieldCheck className="text-brand" size={28} /> Our Principles
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.principles.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-elevated hover:border-brand/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-muted-background rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-brand/10 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h3 className="font-serif font-bold text-foreground text-xl mb-2">
                  {p.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 📚 SOURCES SECTION */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
              <FileText className="text-brand" size={28} /> Sources & References
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-border">
              {about.sources.map((source, idx) => (
                <li 
                  key={idx} 
                  className="p-5 hover:bg-muted-background transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <span className="w-2 h-2 rounded-full bg-brand/40 block"></span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand mb-1 block">
                        {source.type}
                      </span>
                      <span className="font-semibold text-foreground text-base">
                        {source.name}
                      </span>
                    </div>
                  </div>
                  
                  {source.detail && (
                    <span className="text-sm text-muted bg-background border border-border px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {source.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 👥 COMMUNITY & COMMITTEE SECTION */}
        <section className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-elevated relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Users size={200} className="text-brand" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
                <Users className="text-brand" size={28} /> The Community
              </h2>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 mb-10">
              <p className="font-medium text-foreground text-xl leading-relaxed mb-4 flex gap-3">
                <Quote className="text-brand shrink-0 mt-1" size={24} />
                {about.community.lead}
              </p>
              <p>{about.community.contributors}</p>
            </div>
            
            <div className="border-t border-border pt-8">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                Editorial Committee
              </h3>
              <div className="flex flex-wrap gap-4">
                {about.committee.map((member, idx) => (
                  <div 
                    key={idx} 
                    className="bg-muted-background border border-border px-5 py-4 rounded-xl flex items-center gap-4 hover:border-brand/30 transition-colors"
                  >
                    {/* Avatar Placeholder */}
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[11px] text-muted font-bold block mb-0.5 uppercase tracking-wide">
                        {member.role}
                      </span>
                      {member.link ? (
                        <a 
                          href={member.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-foreground hover:text-brand transition-colors flex items-center gap-1.5"
                        >
                          {member.name} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="font-bold text-foreground">{member.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 CTA SECTION */}
        <section className="text-center py-12">
          <Heart className="text-red-500 mx-auto mb-4 animate-pulse" size={32} />
          <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
            Want to contribute to this archive?
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            This portal belongs to the people of Bandwar. Help us preserve our history and culture.
          </p>
          <Link 
            href="/contribute" 
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:-translate-y-0.5"
          >
            Go to Contribute Page
          </Link>
        </section>

      </div>
    </div>
  );
}