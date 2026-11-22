import React from 'react';
import { Provenance } from '@/lib/schema';
import { ConfidenceBadge } from './ConfidenceBadge';
import { provenanceSummary } from '@/lib/provenance';
import { CheckCircle2, Info } from 'lucide-react';

interface ProvenanceBarProps {
  provenance?: Provenance;
  confidence?: string;
}

export function ProvenanceBar({ provenance, confidence }: ProvenanceBarProps) {
  if (!provenance) return null;

  const isVerified = confidence === 'archival' || confidence === 'elder';

  return (
    <div className="my-6 p-4 rounded-lg bg-[#FBF8F3] border border-[#7C2D12]/10 text-sm text-gray-700 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isVerified ? <CheckCircle2 className="w-5 h-5 text-[#1F7A3D]" /> : <Info className="w-5 h-5 text-[#A64B2A]" />}
        </div>
        <div>
          <p className="font-medium text-[#7C2D12]">
            {isVerified ? 'Verified Information' : 'Community Provided'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {provenanceSummary(provenance)}
            {provenance.verifiedAt && ` on ${new Date(provenance.verifiedAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      <div>
        <ConfidenceBadge tier={confidence as any} />
      </div>
    </div>
  );
}