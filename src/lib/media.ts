import 'server-only';
import fs from 'fs';
import path from 'path';

export const FALLBACK_IMAGE = '/fallback.jpg';

function stripQueryString(src: string): string {
  return src.split('?')[0];
}

/**
 * Check if image file exists in /public.
 * External URLs (http/https) are assumed valid.
 */
export function imageExists(src?: string | null): boolean {
  if (!src || src.trim() === '') return false;
  if (src.startsWith('http://') || src.startsWith('https://')) return true;
  const cleanSrc = stripQueryString(src).replace(/^\//, '');
  const fullPath = path.join(process.cwd(), 'public', cleanSrc);
  try {
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

/**
 * Resolve hero image path.
 * Preserves original string (including query) if file exists.
 * Matches previous data.ts `displayHero` behaviour exactly.
 */
export function resolveHeroPath(hero?: string | null): string {
  if (!hero || hero.trim() === '') return FALLBACK_IMAGE;
  if (hero.startsWith('http://') || hero.startsWith('https://')) return hero;
  return imageExists(hero) ? hero : FALLBACK_IMAGE;
}

/**
 * Resolve gallery photo path.
 */
export function resolveGalleryPath(src?: string | null): string {
  return resolveHeroPath(src);
}

/**
 * Resolve person photo path.
 */
export function resolvePersonPhoto(photo?: string | null): string {
  return resolveHeroPath(photo);
}

/**
 * Resolve generic media path (video, audio, documents).
 */
export function resolveMediaPath(src?: string | null): string {
  return resolveHeroPath(src);
}

/**
 * Returns true if hero resolves to a real (non-fallback) image.
 */
export function hasValidHero(hero?: string | null): boolean {
  return resolveHeroPath(hero) !== FALLBACK_IMAGE;
}