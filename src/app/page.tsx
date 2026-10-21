// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getMasterConfig, getAllArticles } from "@/lib/content"; // Ensure getMasterConfig is added
import ArticleCard from "@/components/ArticleCard";

export default function HomePage() {
  const config = getMasterConfig(); // You need to create this function in content.ts
  const allArticles = getAllArticles();
  
  // Get 3 latest articles automatically
  const latestArticles = allArticles
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  const { hero, meta, stats, pullquote, about, cta } = config.home;
  const heroImage = hero.image.startsWith('/') ? hero.image : `/${hero.image}`;

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{ position: "relative", height: "80vh", minHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white" }}>
        <Image src={heroImage} alt={hero.alt} fill priority style={{ objectFit: "cover", zIndex: -1 }} />
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 0 }}></div>
        
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
          <p style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-2)", fontWeight: "bold" }}>{hero.location}</p>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", color: "white", lineHeight: 1, marginBottom: "var(--space-3)" }}>{hero.title}</h1>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.6, marginBottom: "var(--space-6)", color: "#eee" }}>{hero.tagline}</p>
          <Link href={cta.href} className="btn" style={{ backgroundColor: "var(--accent-terra)" }}>{cta.label}</Link>
        </div>
      </section>

      {/* 2. META & STATS BAR */}
      <section style={{ backgroundColor: "var(--accent-green)", color: "var(--white)", padding: "var(--space-4) 0" }}>
        <div className="container grid-4 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: "2rem", fontFamily: "var(--font-display)", fontWeight: "bold" }}>{stat.value}</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LATEST ARTICLES (Auto-generated) */}
      <section className="container" style={{ padding: "var(--space-12) var(--space-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)" }}>
          <h2 className="section-title" style={{ margin: 0, border: "none" }}>Latest from the Archive</h2>
          <Link href="/section" style={{ fontWeight: "bold", color: "var(--accent-green)" }}>View All →</Link>
        </div>
        <div className="grid-3">
          {latestArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 4. PULLQUOTE SECTION */}
      <section style={{ backgroundColor: "var(--bg-surface)", padding: "var(--space-12) 0" }}>
        <div className="container text-center" style={{ maxWidth: "800px" }}>
          <blockquote style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", fontStyle: "italic", lineHeight: 1.6, color: "var(--accent-green)", marginBottom: "var(--space-4)" }}>
            "{pullquote.text}"
          </blockquote>
          <cite style={{ fontSize: "0.875rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>— {pullquote.cite}</cite>
        </div>
      </section>

      {/* 5. ABOUT TEASER */}
      <section className="container" style={{ padding: "var(--space-12) var(--space-3)" }}>
        <div className="grid-2">
          <div>
            <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.875rem", fontWeight: "bold", color: "var(--accent-terra)", marginBottom: "var(--space-2)" }}>{about.eyebrow}</p>
            <h2 style={{ fontSize: "2.5rem", fontFamily: "var(--font-display)", marginBottom: "var(--space-3)" }}>{about.title}</h2>
            {about.paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: "1.125rem", lineHeight: 1.7, marginBottom: "var(--space-3)", color: "var(--text-muted)" }}>{p}</p>
            ))}
            <Link href="/about" style={{ fontWeight: "bold", color: "var(--accent-green)", display: "inline-block", marginTop: "var(--space-2)" }}>Read our principles →</Link>
          </div>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "var(--space-6)", borderRadius: "var(--border-radius)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "var(--space-4)", fontFamily: "var(--font-display)" }}>Explore the Village</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link href="/place" className="btn" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)", textAlign: "center" }}>🗺️ Interactive Map</Link>
              <Link href="/time" className="btn" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)", textAlign: "center" }}>⏳ 2,600-Year Timeline</Link>
              <Link href="/people" className="btn" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)", textAlign: "center" }}>👥 People of Bandwar</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}