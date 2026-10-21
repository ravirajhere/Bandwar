interface InfoboxProps {
  data: Record<string, string>;
  title: string;
}

export function Infobox({ data, title }: InfoboxProps) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside className="bg-[#efece4] border border-[#1a1a18]/10 rounded-lg p-5 mb-8 w-full md:w-[320px] md:float-right md:ml-8 md:mb-4 clear-right">
      <h3 className="font-serif font-bold text-lg text-[#1a1a18] border-b border-[#1a1a18]/20 pb-2 mb-4">
        {title} — Quick Facts
      </h3>
      <dl className="space-y-3 text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col border-b border-[#1a1a18]/5 last:border-0 pb-2 last:pb-0">
            <dt className="text-[#1a1a18]/60 font-medium text-xs uppercase tracking-wider mb-1">
              {key}
            </dt>
            <dd className="text-[#1a1a18] font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}