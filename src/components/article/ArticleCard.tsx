import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/schema";
import { Calendar } from "lucide-react";

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));
  } catch { return dateString; }
};

export function ArticleCard({ article }: { article: Article }) {
  // Safe image path check
  const imageSrc = article.hero 
    ? (article.hero.startsWith("/") ? article.hero : `/${article.hero}`) 
    : null;

  return (
    <Link 
      href={`/article/${article.id}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-elevated hover:border-brand/30 transition-all duration-300 h-full"
    >
      {/* 🖼️ Thumbnail Image (Top) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-muted-background overflow-hidden shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            // ✅ Senior Fix: object-cover lagaya taaki image box ko poora bhare aur professional lage
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 bg-muted-background">
            📄
          </div>
        )}
        
        {/* Category Badge (Floating on Image) */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-foreground uppercase tracking-wider shadow-sm z-10">
          {article.categories[0] || "General"}
        </div>
      </div>

      {/* 📝 Text Content */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-brand transition-colors leading-snug mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        {/* Summary */}
        <p className="text-[15px] text-muted leading-relaxed line-clamp-2 mb-4 flex-grow">
          {article.summary}
        </p>

        {/* Footer Meta (Date) */}
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-brand/70" />
            <time dateTime={article.lastUpdated}>{formatDate(article.lastUpdated)}</time>
          </div>
          
          <span className="text-brand flex items-center font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Read →
          </span>
        </div>

      </div>
    </Link>
  );
}