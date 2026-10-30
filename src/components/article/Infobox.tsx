export function Infobox({ data, title }: { data: Record<string, string>; title: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      className="bg-card border border-border rounded-xl shadow-sm w-full mb-6 overflow-hidden"
    >
      {/* 📌 Infobox Header */}
      <div className="bg-muted-background px-4 py-3 border-b border-border text-center">
        <h3 className="font-serif font-bold text-foreground text-lg m-0 tracking-tight">
          {title}
        </h3>
      </div>

      {/* 📊 Infobox Data Rows */}
      <div className="p-0">
        <dl className="m-0 text-sm sm:text-[15px]">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              className="flex border-b border-border-subtle last:border-0 hover:bg-muted-background/30 transition-colors"
            >
              {/* Key Column (Left - Muted Background) */}
              <dt className="w-[35%] sm:w-[40%] px-4 py-3 bg-muted-background/50 text-foreground/70 font-semibold border-r border-border-subtle leading-snug">
                {key}
              </dt>
              
              {/* Value Column (Right - Card Background) */}
              <dd className="w-[65%] sm:w-[60%] px-4 py-3 text-foreground leading-relaxed break-words text-pretty">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}