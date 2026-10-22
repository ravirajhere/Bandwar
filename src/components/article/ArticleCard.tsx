import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/schema";

// Helper to format date from YYYY-MM-DD to "Oct 15, 2026"
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString; // Fallback if date is invalid
  }
};

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link 
      href={`/article/${article.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-primary/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-surface overflow-hidden">
        {article.hero ? (
          <Image
            src={`/${article.hero}`}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">
            📄
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-accent shadow-sm">
          {article.categories[0]}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-serif text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-sm text-warn font-semibold mb-3 line-clamp-1">
          {article.subtitle}
        </p>
        
        <p className="text-sm text-primary/70 leading-relaxed line-clamp-3 flex-grow">
          {article.summary}
        </p>
        
        {/* Footer Info */}
        <div className="mt-5 pt-4 border-t border-primary/5 flex items-center justify-between text-xs text-primary/50 font-medium">
          <time dateTime={article.lastUpdated}>
            Updated: {formatDate(article.lastUpdated)}
          </time>
          <span className="text-accent font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}