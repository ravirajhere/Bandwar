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
    <div className="my-6 p-3.5 rounded-sm bg-surface border border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">
          {isVerified ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Info className="w-4 h-4 text-ink-muted" />}
        </div>
        <div>
          <p className="font-medium text-xs text-ink uppercase tracking-wider">
            {isVerified ? 'Verified Information' : 'Community Provided'}
          </p>
          <p className="text-[13px] text-ink-muted mt-0.5">
            {provenanceSummary(provenance)}
            {provenance.verifiedAt && ` • ${new Date(provenance.verifiedAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <ConfidenceBadge tier={confidence as any} />
      </div>
    </div>
  );
}