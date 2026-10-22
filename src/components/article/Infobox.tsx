// src/components/article/Infobox.tsx
export function Infobox({ data, title }: { data: Record<string, string>; title: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      // 👇 Sharp corners, solid border
      className="bg-surface border border-primary/30 rounded-sm mb-8 w-full lg:w-[320px] lg:float-right lg:ml-8 lg:mb-6 clear-right"
    >
      <div className="bg-primary px-4 py-3 border-b border-primary/30">
        <h3 className="font-serif font-bold text-base text-paper text-center tracking-wide">
          {title}
        </h3>
      </div>

      <div className="p-0">
        <dl className="text-sm">
          {Object.entries(data).map(([key, value], index) => (
            <div 
              key={key} 
              // 👇 Strict row borders (like a table)
              className={`grid grid-cols-3 border-b border-primary/10 last:border-0 ${index % 2 === 0 ? 'bg-white/50' : ''}`}
            >
              <dt className="col-span-1 p-2 text-primary/70 font-semibold text-xs border-r border-primary/10 bg-surface/50">
                {key}
              </dt>
              <dd className="col-span-2 p-2 text-primary font-medium text-sm leading-snug break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}