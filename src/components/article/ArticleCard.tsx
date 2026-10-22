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
      // 👇 Sharp corners, no floating, subtle hover border
      className="group bg-white rounded-sm overflow-hidden border border-primary/20 hover:border-primary/50 hover:bg-surface/30 transition-colors duration-200 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] bg-surface overflow-hidden border-b border-primary/10">
        {article.hero ? (
          <Image
            src={`/${article.hero}`}
            alt={article.title}
            fill
            className="object-cover" // 👈 No scale animation
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📄</div>
        )}
        
        <div className="absolute top-3 left-3 bg-white border border-primary/20 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary">
          {article.categories[0]}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-serif text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-warn font-medium mb-3 line-clamp-1">{article.subtitle}</p>
        <p className="text-sm text-primary/70 leading-relaxed line-clamp-3 flex-grow">{article.summary}</p>
        
        <div className="mt-5 pt-3 border-t border-primary/10 flex items-center justify-between text-xs text-primary/50 font-medium">
          <time dateTime={article.lastUpdated}>{formatDate(article.lastUpdated)}</time>
          <span className="text-accent font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 group-hover:gap-2 transition-all">
            Read Article <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}