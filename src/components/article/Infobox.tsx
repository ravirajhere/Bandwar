interface InfoboxProps {
  data: Record<string, string>;
  title: string;
}

export function Infobox({ data, title }: InfoboxProps) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      className="bg-surface border border-primary/15 rounded-xl overflow-hidden mb-8 w-full lg:w-[340px] lg:float-right lg:ml-8 lg:mb-6 clear-right shadow-sm"
    >
      {/* Header Section */}
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <span className="text-xs font-bold tracking-widest uppercase text-warn block mb-1">
          Quick Facts
        </span>
        <h3 className="font-serif font-bold text-lg text-primary leading-tight">
          {title}
        </h3>
      </div>

      {/* List Section */}
      <div className="p-5">
        <dl className="space-y-4 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              className="flex flex-col border-b border-primary/10 last:border-0 pb-3 last:pb-0"
            >
              <dt className="text-primary/60 font-semibold text-[11px] uppercase tracking-wider mb-1">
                {key}
              </dt>
              <dd className="text-primary font-medium leading-snug break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}