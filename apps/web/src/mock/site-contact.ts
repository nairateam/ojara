/**
 * Sample contact details for the premium Contact page (14). WhatsApp and the support email come
 * from `SUPPORT` in ./marketing; the phone line, office and department inboxes below are
 * placeholders from the design.
 */

export const CONTACT_PHONE = { display: '+234 1 555 0198', href: 'tel:+23415550198' };

export const CONTACT_DESKS: {
  key: 'support' | 'partners' | 'press';
  title: string;
  body: string;
  /** Omitted for seller support, which uses the shared support inbox. */
  email?: string;
}[] = [
  {
    key: 'support',
    title: 'Seller support',
    body: 'Payments, orders, your store set-up or anything that’s stopped working.',
  },
  {
    key: 'partners',
    title: 'Sales & partnerships',
    body: 'Markets, associations, banks and logistics companies who want to work with us.',
    email: 'partners@ojara.store',
  },
  {
    key: 'press',
    title: 'Press & media',
    body: 'Interviews, data on Nigerian online selling, logos and photos.',
    email: 'press@ojara.store',
  },
];

export const CONTACT_OFFICE = {
  title: 'Visit the Lagos office',
  lines: ['3rd floor, 14 Adeola Odeku Street,', 'Victoria Island, Lagos'],
  note: 'Sellers are welcome to drop in for help setting up — message us first so someone’s free to sit with you.',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=14+Adeola+Odeku+Street%2C+Victoria+Island%2C+Lagos',
};

/** WhatsApp support hours in WAT (24h clock), used for the "Online now" badge. */
export const SUPPORT_OPEN_HOURS = { from: 8, to: 20 };

export const SUPPORT_HOURS: { channel: string; days: string; hours: string }[] = [
  { channel: 'WhatsApp & chat', days: 'Every day', hours: '8am – 8pm' },
  { channel: 'Email', days: 'Every day', hours: 'Within 1 business day' },
  { channel: 'Phone', days: 'Mon – Fri', hours: '9am – 5pm' },
  { channel: 'Office visits', days: 'Mon – Fri', hours: '10am – 4pm' },
  { channel: 'Public holidays', days: 'WhatsApp only', hours: '10am – 4pm' },
];

/** "Popular" chips under the help-centre search; each opens a real help article. */
export const CONTACT_HELP_TOPICS: { label: string; slug: string }[] = [
  { label: 'Payout delays', slug: 'how-paystack-payouts-work' },
  { label: 'Connect a domain', slug: 'connect-your-own-domain' },
  { label: 'Refund a customer', slug: 'refund-a-customer' },
  { label: 'Delivery zones', slug: 'delivery-zones-and-charges' },
  { label: 'Failed payments', slug: 'why-did-a-payment-fail' },
];
