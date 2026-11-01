import { UniversalEditModal } from "@/components/shared/UniversalEditModal";
import { Info } from "lucide-react";

export function Infobox({ data, title, articleId }: { data: Record<string, string>; title: string; articleId?: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      className="bg-surface border border-divider rounded-lg shadow-sm w-full mb-8 overflow-hidden"
    >
      {/* 📌 Infobox Header (Formal & Clean) */}
      <div className="bg-canvas/80 px-5 py-4 3xl:px-6 3xl:py-5 border-b border-divider flex items-center gap-2.5">
        <Info size={18} className="text-accent shrink-0 3xl:w-6 3xl:h-6" />
        <h3 className="font-serif font-bold text-ink text-base 3xl:text-xl m-0 tracking-tight truncate">
          {title}
        </h3>
      </div>

      {/* 📊 Infobox Data Rows */}
      <div className="p-0">
        <dl className="m-0 divide-y divide-divider">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              className="flex group hover:bg-canvas/50 transition-colors duration-200"
            >
              {/* Key Column (Left) */}
              <dt className="w-[38%] sm:w-[40%] px-5 py-3.5 3xl:py-5 text-ink/60 font-medium text-[13px] sm:text-sm 3xl:text-base leading-snug flex items-center break-words">
                {key}
              </dt>
              
              {/* Value Column (Right) */}
              <dd className="w-[62%] sm:w-[60%] px-5 py-3.5 3xl:py-5 text-ink text-[14px] sm:text-[15px] 3xl:text-lg font-medium leading-relaxed break-words text-pretty flex items-center justify-between gap-3">
                <span className="flex-1">{value}</span>
                
                {/* 🚀 Edit Button (Subtle, appears on hover) */}
                {articleId && (
                  <div className="no-print shrink-0 opacity-50 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <UniversalEditModal 
                      fieldName={`Infobox: ${key}`} 
                      currentValue={value} 
                      contextId={articleId} 
                      contextType="Article Infobox" 
                      variant="icon" 
                    />
                  </div>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}