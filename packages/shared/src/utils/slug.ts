import { isReservedSlug, STORE_SLUG_PATTERN } from '../constants/domains.js';

const MAX_SLUG = 40;

/**
 * Store web address suggested from a business name: "Adùnní Threads & Co." -> "adunni-threads-co".
 * Always returns a slug that matches STORE_SLUG_PATTERN and isn't reserved (it may still be taken).
 */
export function suggestStoreSlug(name: string): string {
  let slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG)
    .replace(/-+$/, '');
  if (slug.length < 3) slug = slug ? `${slug}-store` : 'my-store';
  if (isReservedSlug(slug)) slug = `${slug}-store`.slice(0, MAX_SLUG);
  return STORE_SLUG_PATTERN.test(slug) ? slug : 'my-store';
}

/** `base` with a numeric suffix that keeps it within the length limit: ("ada", 2) -> "ada-2". */
export function numberedSlug(base: string, n: number): string {
  const suffix = `-${n}`;
  return `${base.slice(0, MAX_SLUG - suffix.length).replace(/-+$/, '')}${suffix}`;
}
