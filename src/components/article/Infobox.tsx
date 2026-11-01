import { Info } from "lucide-react";
import { EditableInfoboxRow } from "@/components/editor/EditableInfoboxRow";

export function Infobox({
  data,
  title,
  articleId,
}: {
  data: Record<string, string>;
  title: string;
  articleId?: string;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <aside
      aria-label={`Quick facts about ${title}`}
      className="bg-surface border border-divider rounded-sm w-full mb-8 overflow-hidden"
    >
      {/* Infobox Header */}
      <div className="bg-canvas/80 px-4 py-3 border-b border-divider flex items-center gap-2">
        <Info size={16} className="text-accent shrink-0" />
        <h3 className="font-serif font-bold text-ink text-sm m-0 tracking-tight truncate">
          {title}
        </h3>
      </div>

      {/* Infobox Data Rows */}
      <dl className="m-0 divide-y divide-divider">
        {Object.entries(data).map(([key, value]) => (
          <EditableInfoboxRow
            key={key}
            label={key}
            initialValue={value}
            contextId={articleId || title}
            contextType="Article Infobox"
          />
        ))}
      </dl>
    </aside>
  );
}