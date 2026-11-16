/**
 * Store policy pages. Merchants can't write their own policies yet (storefront editor), and Ojara
 * must not invent terms on their behalf, so every policy says it hasn't been published and points
 * shoppers to the store's contact details.
 */

export interface StorePolicy {
  slug: string;
  title: string;
  sections: { heading: string; body: string }[];
}

const TITLES: Record<string, string> = {
  returns: 'Returns & exchanges',
  delivery: 'Delivery & pickup',
  privacy: 'Privacy',
  terms: 'Terms of sale',
};

export const POLICY_SLUGS = Object.keys(TITLES);

export function storePolicy(
  slug: string,
  store: { name: string; whatsapp: string | null; email: string | null },
): StorePolicy | null {
  const title = TITLES[slug];
  if (!title) return null;
  const contact = [store.whatsapp && `WhatsApp ${store.whatsapp}`, store.email]
    .filter(Boolean)
    .join(' or ');
  return {
    slug,
    title,
    sections: [
      {
        heading: 'Not published yet',
        body: `${store.name} hasn’t published its ${title.toLowerCase()} policy on this site yet. Please ask the store before you order${contact ? `: ${contact}` : ''}.`,
      },
    ],
  };
}
