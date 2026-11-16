/**
 * Copy for the premium Stores directory (12). The stores themselves live in ./marketing
 * (`DIRECTORY_STORES`, `FEATURED_STORE`, `STORE_FILTERS`).
 */

export const STORES_HERO = {
  badge: 'Nigerian stores live right now',
  line1: 'Real stalls.',
  line2: 'Selling for real.',
  sub: 'Browse shops built on Ojara — from adire in Ibadan to gadgets in Ikeja. Buy something, or borrow an idea for your own.',
  searchPlaceholder: 'Search stores, products or cities',
};

export const STORES_DIRECTORY = {
  eyebrow: 'All stores',
  line1: 'Find your next',
  line2: 'favourite seller.',
};

/** Directory sort options; `popular` keeps the curated order of `DIRECTORY_STORES`. */
export const STORE_SORTS = [
  { key: 'popular', label: 'Most popular' },
  { key: 'products', label: 'Most products' },
  { key: 'name', label: 'Name A–Z' },
] as const;

export type StoreSort = (typeof STORE_SORTS)[number]['key'];

export const STORES_GET_FEATURED = {
  line1: 'Your stall could be',
  line2: 'right here.',
  body: 'Every store on a paid plan can join the directory. We pick a Store of the Month from sellers who share their story with us.',
};
