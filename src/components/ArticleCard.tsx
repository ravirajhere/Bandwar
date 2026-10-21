// src/components/ArticleCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/schemas";

export default function ArticleCard({ article }: { article: Article }) {
  const imageUrl = article.hero.startsWith('/') ? article.hero : `/${article.hero}`;

  return (
    <Link href={`/article/${article.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "16/9", backgroundColor: "var(--bg-base)" }}>
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        
        {/* Content */}
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "bold", color: "var(--accent-terra)", marginBottom: "var(--space-1)" }}>
            {article.categories[0]}
          </span>
          <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-display)", marginBottom: "var(--space-2)", lineHeight: 1.3 }}>
            {article.title}
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "var(--space-3)", flexGrow: 1 }}>
            {article.subtitle}
          </p>
          <div style={{ fontSize: "0.875rem", fontWeight: "bold", color: "var(--accent-green)" }}>
            Read Article →
          </div>
        </div>
      </article>
    </Link>
  );
}