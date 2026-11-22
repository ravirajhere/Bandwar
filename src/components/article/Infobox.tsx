import React from 'react';
import { Article } from '@/lib/schema';
import { getInfoboxEntries } from '@/lib/infobox';
import { ConfidenceBadge } from './ConfidenceBadge';

export function Infobox({ article }: { article: Article }) {
  const entries = getInfoboxEntries(article);
  if (entries.length === 0) return null;

  return (
    <aside className="bg-[#FBF8F3] border border-[#7C2D12]/10 rounded-xl p-5 my-6">
      <h3 className="font-serif text-lg font-semibold text-[#7C2D12] mb-4 pb-2 border-b border-[#7C2D12]/10">
        Key Facts
      </h3>
      <dl className="space-y-3 text-sm">
        {entries.map((entry) => (
          <div key={entry.key} className="grid grid-cols-3 gap-2">
            <dt className="text-gray-500 font-medium col-span-1">{entry.key}</dt>
            <dd className="text-gray-800 col-span-2 flex items-start gap-2 flex-wrap">
              <span>{entry.value}</span>
              {/* Show confidence badge only if it's NOT unverified, to reduce visual noise */}
              {entry.confidence && entry.confidence !== 'unverified' && (
                <ConfidenceBadge tier={entry.confidence} className="scale-75 origin-left" />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}