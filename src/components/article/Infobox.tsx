import { UniversalEditModal } from "@/components/shared/UniversalEditModal";
import { Info } from "lucide-react"; // 👈 Header ke liye icon import kiya

export function Infobox({ data, title, articleId }: { data: Record<string, string>; title: string; articleId?: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      className="bg-card border border-border rounded-2xl shadow-sm w-full mb-8 overflow-hidden"
    >
      {/* 📌 Infobox Header (Premium Look) */}
      <div className="bg-muted-background/80 px-5 py-4 border-b border-border flex items-center gap-2">
        <Info size={18} className="text-brand shrink-0" />
        <h3 className="font-serif font-bold text-foreground text-[17px] m-0 tracking-tight truncate">
          {title}
        </h3>
      </div>

      {/* 📊 Infobox Data Rows */}
      <div className="p-0">
        <dl className="m-0 divide-y divide-border-subtle">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              className="flex group hover:bg-muted-background/40 transition-colors duration-200"
            >
              {/* Key Column (Left) */}
              <dt className="w-[38%] sm:w-[40%] px-5 py-3.5 text-foreground/60 font-medium text-[13px] sm:text-[14px] leading-snug flex items-center">
                {key}
              </dt>
              
              {/* Value Column (Right) */}
              <dd className="w-[62%] sm:w-[60%] px-5 py-3.5 text-foreground text-[14px] sm:text-[15px] font-medium leading-relaxed break-words text-pretty flex items-center justify-between gap-2">
                <span>{value}</span>
                
                {/* 🚀 Edit Button (Desktop pe hover par, Mobile pe always visible) */}
                {articleId && (
                  <div className="no-print shrink-0">
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