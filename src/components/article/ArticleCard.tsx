import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/schema";
import { Calendar, Image as ImageIcon, ArrowRight } from "lucide-react";

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
      className="group flex flex-col bg-surface border border-divider rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      {/* 🖼️ Thumbnail Image (Top) */}
      <div className="relative w-full aspect-[16/9] 3xl:aspect-[21/9] bg-canvas overflow-hidden shrink-0 flex items-center justify-center border-b border-divider">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // ✅ Formal Fallback: Agar image nahi hai toh yeh dikhega
          <div className="flex flex-col items-center justify-center text-ink/20">
            <ImageIcon size={40} className="mb-2 3xl:w-16 3xl:h-16" />
            <span className="text-[11px] 3xl:text-xs font-bold uppercase tracking-wider">No Image Available</span>
          </div>
        )}
        
        {/* Category Badge (Dark Glass Effect) */}
        <div className="absolute top-3 left-3 bg-ink/70 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-md text-[10px] 3xl:text-xs font-bold text-white uppercase tracking-wider shadow-sm z-10">
          {article.categories[0] || "General"}
        </div>
      </div>

      {/* 📝 Text Content */}
      <div className="p-5 3xl:p-6 flex flex-col flex-grow">
        
        {/* Title */}
        <h3 className="font-serif text-lg md:text-xl 3xl:text-2xl font-bold text-ink group-hover:text-accent transition-colors leading-snug mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        {/* Summary */}
        <p className="text-sm md:text-[15px] 3xl:text-base text-ink/70 leading-relaxed line-clamp-2 3xl:line-clamp-3 mb-4 flex-grow">
          {article.summary}
        </p>

        {/* Footer Meta (Date & Read Button) */}
        <div className="mt-auto pt-4 border-t border-divider flex items-center justify-between text-xs 3xl:text-sm text-ink/50 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-accent/70 3xl:w-4 3xl:h-4" />
            <time dateTime={article.lastUpdated}>{formatDate(article.lastUpdated)}</time>
          </div>
          
          <span className="text-accent flex items-center gap-1 font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 3xl:text-base">
            Read <ArrowRight size={14} className="3xl:w-4 3xl:h-4" />
          </span>
        </div>

      </div>
    </Link>
  );
}