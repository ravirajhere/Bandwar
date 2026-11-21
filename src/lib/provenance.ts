import type { Provenance, ConfidenceTier } from './schema';

const CONFIDENCE_LABELS: Record<ConfidenceTier, string> = {
  unverified: 'Unverified',
  community: 'Community confirmed',
  elder: 'Elder-validated',
  archival: 'Archival',
  contested: 'Contested',
};

const CONFIDENCE_ICONS: Record<ConfidenceTier, string> = {
  unverified: '○',
  community: '◐',
  elder: '◑',
  archival: '●',
  contested: '⚡',
};

/**
 * Get entity provenance + confidence (with unverified default).
 */
export function getEntityProvenance(entity: {
  provenance?: Provenance;
  confidence?: ConfidenceTier;
}): { provenance?: Provenance; confidence: ConfidenceTier } {
  return {
    provenance: entity.provenance,
    confidence: entity.confidence ?? 'unverified',
  };
}

/**
 * Display label for confidence tier.
 */
export function confidenceLabel(tier: ConfidenceTier): string {
  return CONFIDENCE_LABELS[tier];
}

/**
 * Display icon for confidence tier.
 */
export function confidenceIcon(tier: ConfidenceTier): string {
  return CONFIDENCE_ICONS[tier];
}

/**
 * True if entity has non-empty provenance attached.
 */
export function hasProvenance(entity: { provenance?: Provenance }): boolean {
  return !!entity.provenance && Object.keys(entity.provenance).length > 0;
}

/**
 * Human-readable summary of provenance for UI (Phase 1 will refine).
 */
export function provenanceSummary(provenance?: Provenance): string {
  if (!provenance) return 'No source recorded';
  const parts: string[] = [];
  if (provenance.sourceLabel) parts.push(provenance.sourceLabel);
  if (provenance.method) parts.push(`via ${provenance.method}`);
  if (provenance.verifiedBy) parts.push(`by ${provenance.verifiedBy}`);
  return parts.length > 0 ? parts.join(' ') : 'Source recorded';
}