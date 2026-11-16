/**
 * Sample content for the premium How it works page (10). Copy is from the design, trimmed where it
 * promised something Ojara doesn't do yet (templates, WhatsApp order updates, courier and
 * spreadsheet integrations). Money is integer kobo, formatted with `formatKobo` at render time.
 */

/** Hero chapter index; `id` is the anchor of each chapter section. */
export const HIW_CHAPTERS = [
  { id: 'storefront', title: 'Your storefront' },
  { id: 'checkout', title: 'Paystack checkout' },
  { id: 'orders', title: 'Orders inbox' },
  { id: 'stock', title: 'Honest stock' },
  { id: 'payouts', title: 'Payouts' },
  { id: 'sharing', title: 'Sharing' },
] as const;

export const HIW_STOREFRONT_POINTS = [
  'Built for phone screens first',
  'Your logo, your colours, your own .com on Starter',
  'Product pages that look sharp when they’re shared on WhatsApp',
];

export const HIW_CHECKOUT_POINTS = [
  { title: 'Card, bank transfer or USSD', body: 'Customers pay the way they already do.' },
  {
    title: 'No chasing proof of payment',
    body: 'Ojara marks the order paid the moment Paystack confirms.',
  },
  { title: 'No cut of your sales', body: 'Paystack’s fee is the only charge on each payment.' },
];

export const HIW_CHECKOUT_SUCCESS = { amountKobo: 2_700_000, customer: 'Tunde B.' };

export const HIW_ORDERS: { initials: string; name: string; status: string; amountKobo: number }[] =
  [
    { initials: 'CO', name: 'Chiamaka Obi', status: 'Paid · Packing', amountKobo: 3_650_000 },
    { initials: 'TB', name: 'Tunde Bakare', status: 'Paid · Ready', amountKobo: 2_700_000 },
    { initials: 'AB', name: 'Aisha Bello', status: 'Pending · —', amountKobo: 5_200_000 },
    { initials: 'EO', name: 'Efe Okoro', status: 'Paid · Shipped', amountKobo: 2_400_000 },
  ];

export const HIW_ORDERS_POINTS = [
  'Mark packed, sent and delivered in a tap',
  'Customers get an email when their order is confirmed',
  'Filter by unpaid, to pack or out for delivery',
];

export const HIW_STOCK: {
  name: string;
  left: number;
  /** Fill of the bar, 0–1. */
  level: number;
  tone: 'low' | 'out' | 'ok';
}[] = [
  { name: 'Adire Wrap Dress · M', left: 2, level: 0.11, tone: 'low' },
  { name: 'Kampala Shirt · L', left: 0, level: 0.005, tone: 'out' },
  { name: 'Aso-oke Gele', left: 8, level: 0.43, tone: 'ok' },
];

export const HIW_STOCK_POINTS = [
  'Counts update the moment Paystack confirms',
  'Low-stock nudges you set per product',
  'Sold-out items can’t be bought — no awkward refunds',
];

export const HIW_PAYOUT = {
  label: 'Paid out Monday · GTBank ••6789',
  amountKobo: 11_830_000,
  note: '14 payments · fees shown upfront',
};

export const HIW_SHARE = {
  host: 'adunni.ojara.store',
  channels: ['WhatsApp', 'Instagram', 'TikTok'],
};

/** "Plays well with": only things Ojara really connects to or links from. */
export const HIW_INTEGRATIONS: {
  name: string;
  body: string;
  icon: 'credit-card' | 'message-circle' | 'instagram' | 'music';
}[] = [
  { name: 'Paystack', body: 'Card, transfer and USSD checkout', icon: 'credit-card' },
  { name: 'WhatsApp', body: 'Share products and your store link', icon: 'message-circle' },
  { name: 'Instagram', body: 'Your store as your link in bio', icon: 'instagram' },
  { name: 'TikTok', body: 'Shop link on your profile', icon: 'music' },
];
