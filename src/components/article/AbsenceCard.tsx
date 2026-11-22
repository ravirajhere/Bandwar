import React from 'react';
import { AbsenceRecord } from '@/lib/schema';
import { FileQuestion } from 'lucide-react';

export function AbsenceCard({ absence }: { absence: AbsenceRecord }) {
  return (
    <div className="border border-dashed border-accent/40 bg-accent/5 rounded-sm p-4 my-6">
      <div className="flex items-start gap-3">
        <FileQuestion className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
            Missing from the Archive
          </h4>
          <p className="text-sm text-ink leading-relaxed">
            {absence.description}
          </p>
          <div className="mt-2 text-xs text-ink-muted">
            Status: <span className="font-medium uppercase tracking-wider">{absence.reason}</span>
          </div>
        </div>
      </div>
    </div>
  );
}