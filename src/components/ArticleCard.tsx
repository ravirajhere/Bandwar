import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/schema"; // 👈 Yahan 'schema' hai, 'schemas' nahi

export function ArticleCard({ article }: { article: Article }) {
  // Image path check: agar JSON mein "/" nahi hai toh add karega
  const imageUrl = article.hero 
    ? (article.hero.startsWith('/') ? article.hero : `/${article.hero}`) 
    : null;

  return (
    <Link 
      href={`/article/${article.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-[#1a1a18]/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-video bg-[#efece4] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">📄</div>
        )}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-[#1f3d2f]">
          {article.categories[0]}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-serif text-xl font-bold text-[#1a1a18] mb-2 group-hover:text-[#1f3d2f] transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-[#a64b2a] font-medium mb-3 line-clamp-1">
          {article.subtitle}
        </p>
        <p className="text-sm text-[#1a1a18]/70 leading-relaxed line-clamp-3 flex-grow">
          {article.summary}
        </p>
        
        <div className="mt-4 pt-4 border-t border-[#1a1a18]/5 flex items-center justify-between text-xs text-[#1a1a18]/50 font-medium">
          <span>Updated: {article.lastUpdated}</span>
          <span className="text-[#1f3d2f] font-bold group-hover:translate-x-1 transition-transform">Read →</span>
        </div>
      </div>
    </Link>
  );
}