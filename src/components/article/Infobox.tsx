import React from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ConfidenceTier } from "@/lib/schema";

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
          <div key={key} className="grid grid-cols-[100px_minmax(0,1fr)] gap-2">
            <dt className="text-ink-muted font-medium text-xs 3xl:text-sm pt-0.5 truncate" title={key}>
              {key}
            </dt>
            <dd className="text-ink flex flex-wrap items-center gap-2 text-xs 3xl:text-sm leading-snug">
              <span>{val.value}</span>
              {/* Sirf tab dikhao jab unverified na ho, taaki visual clutter na ho */}
              {val.confidence && val.confidence !== "unverified" && (
                <ConfidenceBadge tier={val.confidence} className="scale-90 origin-left" />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}