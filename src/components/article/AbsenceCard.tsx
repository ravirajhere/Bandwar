import React from 'react';
import { AbsenceRecord } from '@/lib/schema';
import { FileQuestion } from 'lucide-react';

export function AbsenceCard({ absence }: { absence: AbsenceRecord }) {
  return (
    <div className="border border-dashed border-[#A64B2A]/40 bg-[#A64B2A]/5 rounded-lg p-4 my-6">
      <div className="flex items-start gap-3">
        <FileQuestion className="w-5 h-5 text-[#A64B2A] mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-[#A64B2A] uppercase tracking-wider mb-1">
            Missing from the Archive
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {absence.description}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Status: <span className="font-medium">{absence.reason}</span>
          </div>
        </div>
      </div>
    </div>
  );
}