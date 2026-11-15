/**
 * Platform root domain used when no ROOT_DOMAIN env override is set.
 * Local development uses `*.ojara.localhost`, which modern browsers resolve to 127.0.0.1.
 */
export const DEFAULT_ROOT_DOMAIN = 'ojara.localhost';

/** Sub-domains owned by the platform. They can never be used as a store slug. */
export const PLATFORM_SUBDOMAINS = {
  app: 'app',
  admin: 'admin',
  api: 'api',
  www: 'www',
} as const;

export type PlatformSubdomain = (typeof PLATFORM_SUBDOMAINS)[keyof typeof PLATFORM_SUBDOMAINS];

/**
 * Slugs rejected at store creation: the platform sub-domains plus words that would be
 * confusing or abusable as a store address.
 */
export const RESERVED_SLUGS: readonly string[] = [
  ...Object.values(PLATFORM_SUBDOMAINS),
  'auth',
  'login',
  'signup',
  'register',
  'dashboard',
  'help',
  'support',
  'status',
  'mail',
  'email',
  'docs',
  'blog',
  'static',
  'assets',
  'cdn',
  'media',
  'images',
  'store',
  'stores',
  'ojara',
  'paystack',
  'billing',
  'checkout',
  'internal',
  'localhost',
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

/** Store slugs: 3-40 chars, lowercase letters, digits and single hyphens, no leading/trailing hyphen. */
export const STORE_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){2,39}$/;
