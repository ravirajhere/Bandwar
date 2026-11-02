interface CategoryConfig {
  [key: string]: { number: string; color: string; label: string };
}

export function MapLegend({ categories }: { categories: CategoryConfig }) {
  return (
    <div className="absolute bottom-4 left-4 z-[400] bg-surface/95 backdrop-blur-sm border border-divider rounded-sm shadow-sm p-2.5 min-w-[150px] max-w-[180px] hidden md:block">
      
      {/* Header */}
      <h4 className="text-[9px] font-bold text-ink/50 uppercase tracking-[0.15em] mb-1.5 pb-1.5 border-b border-divider">
        Legend
      </h4>
      
      {/* Category List */}
      <ul className="space-y-1">
        {Object.entries(categories).map(([key, config]) => (
          <li key={key} className="flex items-center gap-2">
            <span 
              className="w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-white shrink-0 font-serif"
              style={{ backgroundColor: config.color }}
            >
              {config.number}
            </span>
            <span className="text-[10px] text-ink/80 font-medium leading-tight">
              {config.label}
            </span>
          </li>
        ))}
      </ul>
      
      {/* Footer Note */}
      <div className="mt-2 pt-1.5 border-t border-divider">
        <p className="text-[8px] text-ink/40 uppercase tracking-wider">
          Bandwar Archive · 2026
        </p>
      </div>
    </div>
  );
}