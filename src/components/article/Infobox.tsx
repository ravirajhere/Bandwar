export function Infobox({ data, title }: { data: Record<string, string>; title: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside 
      aria-label={`Quick facts about ${title}`}
      className="bg-wiki-bg-alt border border-wiki-border w-full text-sm mb-6"
    >
      {/* Infobox Header */}
      <div className="bg-wiki-header px-4 py-2 border-b border-wiki-border text-center">
        <h3 className="font-bold text-wiki-text text-base m-0">
          {title}
        </h3>
      </div>

      {/* Infobox Data Rows */}
      <div className="p-0">
        <dl className="m-0">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key} 
              className="flex border-b border-wiki-border-light last:border-0"
            >
              {/* Key Column */}
              <dt className="w-[35%] p-2.5 bg-wiki-bg-alt text-wiki-text font-bold text-[13px] border-r border-wiki-border-light leading-snug">
                {key}
              </dt>
              
              {/* Value Column */}
              <dd className="w-[65%] p-2.5 bg-wiki-bg text-wiki-text text-[13px] leading-snug break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}