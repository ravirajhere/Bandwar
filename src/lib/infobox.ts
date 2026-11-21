import type { Article, Provenance, ConfidenceTier } from './schema';

export interface InfoboxEntry {
  key: string;
  value: string;
  provenance?: Provenance;
  confidence?: ConfidenceTier;
}

/**
 * Get single infobox value as string.
 * Backward compatible — replaces `article.infobox[key]` direct access.
 */
export function getInfoboxValue(
  article: Pick<Article, 'infobox'>,
  key: string
): string {
  return article.infobox?.[key]?.value ?? '';
}

/**
 * Get all infobox entries as structured array (preserves insertion order).
 * Use this in Infobox.tsx rendering.
 */
export function getInfoboxEntries(
  article: Pick<Article, 'infobox'>
): InfoboxEntry[] {
  if (!article.infobox) return [];
  return Object.entries(article.infobox).map(([key, val]) => ({
    key,
    value: val.value,
    provenance: val.provenance,
    confidence: val.confidence,
  }));
}

/**
 * Get single entry with full metadata.
 */
export function getInfoboxEntry(
  article: Pick<Article, 'infobox'>,
  key: string
): InfoboxEntry | undefined {
  const val = article.infobox?.[key];
  if (!val) return undefined;
  return {
    key,
    value: val.value,
    provenance: val.provenance,
    confidence: val.confidence,
  };
}