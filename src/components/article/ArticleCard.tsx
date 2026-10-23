// src/components/article/ArticleCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/schema";

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));
  } catch { return dateString; }
};

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link 
      href={`/article/${article.id}`}
      // Wikipedia Style: White background, thin border, no heavy shadows or animations
      className="group bg-wiki-bg border border-wiki-border-light flex flex-col sm:flex-row h-full hover:bg-wiki-bg-alt transition-colors"
    >
      {/* Thumbnail Image (Left Side on Desktop) */}
      <div className="relative w-full sm:w-[160px] shrink-0 aspect-[4/3] sm:aspect-auto bg-wiki-bg-alt border-b sm:border-b-0 sm:border-r border-wiki-border-light overflow-hidden">
        {article.hero ? (
          <Image
            src={`/${article.hero}`}
            alt={article.title}
            fill
            // 👇 Yahan object-contain aur p-1 add kiya hai taaki image pure dikhe 👇
            className="object-contain p-1"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">📄</div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-center">
        
        {/* Category Tag (Small & Subtle) */}
        <span className="text-[11px] font-bold text-wiki-text-muted uppercase tracking-wider mb-1">
          {article.categories[0]}
        </span>

        {/* Title (Classic Blue Link) */}
        <h3 className="font-serif text-lg font-bold text-wiki-link group-hover:underline leading-tight mb-1">
          {article.title}
        </h3>
        
        {/* Subtitle / Date */}
        <div className="text-[12px] text-wiki-text-muted mb-2 flex flex-wrap items-center gap-x-2">
          {article.subtitle && <span className="italic">{article.subtitle}</span>}
          {article.subtitle && <span aria-hidden="true">•</span>}
          <time dateTime={article.lastUpdated}>Updated: {formatDate(article.lastUpdated)}</time>
        </div>

        {/* Summary */}
        <p className="text-[13px] text-wiki-text leading-relaxed line-clamp-2">
          {article.summary}
        </p>
      </div>
    </Link>
  );
}