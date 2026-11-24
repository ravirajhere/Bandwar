import React from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ConfidenceTier } from "@/lib/schema";
import { EditableInfoboxRow } from "@/components/editor/EditableInfoboxRow";

interface InfoboxProps {
  data?: Record<string, { value: string; confidence?: ConfidenceTier }>;
  title: string;
  articleId: string;
}

export function Infobox({ data, title, articleId }: InfoboxProps) {
  if (!data || Object.keys(data).length === 0) return null;

  const entries = Object.entries(data);

  return (
    <aside className="bg-surface border border-divider rounded-sm p-4 3xl:p-5 text-sm">
      <h3 className="font-serif text-base 3xl:text-lg font-bold text-ink mb-3 pb-2 border-b border-divider">
        Key Facts
      </h3>
      <dl className="space-y-2.5">
        {entries.map(([key, val]) => (
          <div key={key}>
            <EditableInfoboxRow
              label={key}
              initialValue={val.value}
              contextId={articleId}
              contextType="Article"
            />
            {val.confidence && val.confidence !== "unverified" && (
              <div className="pl-5 pb-1">
                <ConfidenceBadge tier={val.confidence} className="scale-90 origin-left" />
              </div>
            )}
          </div>
        ))}
      </dl>
    </aside>
  );
}