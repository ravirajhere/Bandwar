import { Info } from "lucide-react";
import { EditableInfoboxRow } from "@/components/editor/EditableInfoboxRow";

// NEW: Supports BOTH legacy string + new Zod shape
type InfoboxValue =
  | string
  | {
      value: string;
      confidence?: string;
      provenance?: {
        sourceLabel?: string;
        sourceUrl?: string;
        verifiedBy?: string;
        notes?: string;
      };
    };

function getValue(v: InfoboxValue): string {
  if (typeof v === "string") return v;
  return v?.value ?? "";
}

function getConfidence(v: InfoboxValue): string | undefined {
  if (typeof v === "string") return undefined;
  return v?.confidence;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  community: "Community",
  elder: "Elder Verified",
  archival: "Archival",
  contested: "Contested",
};

const CONFIDENCE_STYLE: Record<string, string> = {
  community: "bg-blue-50 text-blue-700 border-blue-200",
  elder: "bg-green-50 text-green-700 border-green-200",
  archival: "bg-amber-50 text-amber-700 border-amber-200",
  contested: "bg-red-50 text-red-700 border-red-200",
};

export function Infobox({
  data,
  title,
  articleId,
}: {
  data: Record<string, InfoboxValue>;
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
        <Info size={16} className="text-accent shrink-0" aria-hidden="true" />
        <h3 className="font-serif font-bold text-ink text-sm m-0 tracking-tight truncate">
          {title}
        </h3>
      </div>

      {/* Infobox Data Rows */}
      <dl className="m-0 divide-y divide-divider">
        {Object.entries(data).map(([key, rawValue]) => {
          const value = getValue(rawValue);
          const confidence = getConfidence(rawValue);
          if (!value) return null;

          return (
            <div key={key} className="relative">
              <EditableInfoboxRow
                label={key}
                initialValue={value}
                contextId={articleId || title}
                contextType="Article Infobox"
              />
              {confidence && confidence !== "unverified" && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center border px-1.5 py-0.5 text-[10px] font-semibold rounded-full pointer-events-none ${
                    CONFIDENCE_STYLE[confidence] ?? "bg-ink/5 text-ink-muted border-divider"
                  }`}
                  title={`Confidence: ${confidence}`}
                >
                  {CONFIDENCE_LABEL[confidence] ?? confidence}
                </span>
              )}
            </div>
          );
        })}
      </dl>
    </aside>
  );
}