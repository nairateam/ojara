/**
 * Sample data for the merchant "store & settings" screens (03.10–03.19): storefront editor,
 * delivery, payments, domains, help and settings. Money is integer kobo (format with formatKobo).
 * TODO(api): replace with GET /v1/stores/:id/... once those endpoints exist.
 */
import type { PlanKey } from '@ojara/shared';

export const STORE = {
  name: 'Adùnní Threads',
  ownerName: 'Adùnní Ogunleye',
  ownerFirstName: 'Adùnní',
  ownerEmail: 'adunni@adunnithreads.com',
  ojaraAddress: 'adunni.ojara.store',
  customDomain: 'adunnithreads.com',
  category: 'Fashion & clothing',
  description: 'Hand-dyed adire and aso-oke pieces from Lagos & Abeokuta.',
  whatsapp: '803 555 0144',
  supportEmail: 'hello@adunnithreads.com',
  address: '12 Adeniran Ogunsanya St, Surulere, Lagos',
  instagram: 'adunnithreads',
  plan: 'STARTER' as PlanKey,
  productCount: 18,
} as const;

/* ------------------------------------------------------------------ 03.10 Storefront editor */

export type ThemeKey = 'market' | 'minimal' | 'bold';

export const THEMES: {
  key: ThemeKey;
  name: string;
  page: string;
  a: string;
  b: string;
  soon?: boolean;
}[] = [
  { key: 'market', name: 'Market', page: '#FBF8F2', a: '#2A3A7C', b: '#B5532E' },
  { key: 'minimal', name: 'Minimal', page: '#F5F6EE', a: '#1C1B18', b: '#D6DAC6' },
  { key: 'bold', name: 'Bold', page: '#333A2F', a: '#E9A23B', b: '#EBEDDF', soon: true },
];

export const BRAND_COLOURS = ['#2A3A7C', '#B5532E', '#2F5D46', '#6B2E5C', '#2B2B2B'];

export type HomepageSectionKey =
  'announcement' | 'hero' | 'categories' | 'new' | 'story' | 'instagram';

export const HOMEPAGE_SECTIONS: {
  key: HomepageSectionKey;
  label: string;
  enabled: boolean;
  lockedPlan?: 'STARTER' | 'PROFESSIONAL';
}[] = [
  { key: 'announcement', label: 'Announcement bar', enabled: true },
  { key: 'hero', label: 'Hero banner', enabled: true },
  { key: 'categories', label: 'Shop by category', enabled: true },
  { key: 'new', label: 'New this week', enabled: true },
  { key: 'story', label: 'Our story', enabled: true },
  { key: 'instagram', label: 'Instagram feed', enabled: false, lockedPlan: 'STARTER' },
];

export const STORE_NAV = ['Shop all', 'Dresses', 'Headwear', 'Men', 'Fabrics', 'Our story'];

export const STORE_CATEGORIES = [
  { name: 'Dresses', count: 6, image: '/mock/generated-4.jpg' },
  { name: 'Headwear', count: 3, image: '/mock/generated-2.jpg' },
  { name: 'Men', count: 3, image: '/mock/generated-3.jpg' },
  { name: 'Fabrics & bags', count: 4, image: '/mock/generated-5.jpg' },
];

export const NEW_THIS_WEEK = [
  { name: 'Adire Wrap Dress', priceKobo: 1_850_000, image: '/mock/generated.jpg' },
  { name: 'Ankara Two-piece Set', priceKobo: 2_600_000, image: '/mock/generated-9.jpg' },
  { name: 'Aso-oke Gele', priceKobo: 1_400_000, image: '/mock/generated-7.jpg' },
  { name: 'Indigo Kaftan', priceKobo: 1_750_000, image: '/mock/generated-12.jpg' },
];

/* ---------------------------------------------------------------------------- 03.11 Delivery */

export const DELIVERY_ZONES = [
  {
    name: 'Lagos Mainland',
    covers: 'Yaba, Surulere, Ikeja, Maryland',
    chargeKobo: 200_000,
    arrives: '1–2 days',
  },
  {
    name: 'Lekki & VI',
    covers: 'Lekki, Ajah, Victoria Island, Ikoyi',
    chargeKobo: 250_000,
    arrives: '1–2 days',
  },
  {
    name: 'Lagos outskirts',
    covers: 'Ikorodu, Epe, Badagry',
    chargeKobo: 350_000,
    arrives: '2–3 days',
  },
  {
    name: 'Other states',
    covers: 'Nationwide by courier',
    chargeKobo: 500_000,
    arrives: '3–5 days',
  },
];

export const DELIVERY_SETTINGS = {
  freeOverKobo: 4_000_000,
  pickupAddress: '12 Adeniran Ogunsanya St, Surulere, Lagos',
  openingHours: 'Mon–Sat, 10am – 6pm',
  readyIn: '1 business day',
  cutOff: 'Orders paid before 2:00pm',
  confirmationMessage:
    'We pack every order by hand. You’ll get an SMS with your rider’s number when it leaves our Surulere studio.',
  checkoutSubtotalKobo: 2_450_000,
};

/* ---------------------------------------------------------------------------- 03.12 Payments */

export type TxnStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  when: string;
  order: string;
  customer: string;
  note?: { text: string; tone: 'warning' | 'danger' | 'muted' };
  method: string;
  amountKobo: number;
  feeKobo: number | null;
  status: TxnStatus;
}

export const PAYMENT_KPIS = {
  collectedKobo: 128_450_000,
  successfulCount: 86,
  feesKobo: 2_195_000,
  feePercent: '1.7%',
  paidOutKobo: 119_005_000,
  payoutCount: 14,
  nextPayoutKobo: 7_250_000,
  nextPayoutDate: 'Mon 17 Nov',
  nextPayoutLong: 'Monday 17 Nov',
  nextPayoutPayments: 3,
};

export const TRANSACTIONS: Transaction[] = [
  {
    when: 'Today 10:43',
    order: '#OJ-1048',
    customer: 'Chiamaka Obi',
    method: 'Card ••2207',
    amountKobo: 3_650_000,
    feeKobo: 64_800,
    status: 'SUCCESSFUL',
  },
  {
    when: 'Today 09:16',
    order: '#OJ-1047',
    customer: 'Tunde Bakare',
    method: 'Card ••4821',
    amountKobo: 2_700_000,
    feeKobo: 50_500,
    status: 'SUCCESSFUL',
  },
  {
    when: 'Yesterday 18:21',
    order: '#OJ-1046',
    customer: 'Aisha Bello',
    note: { text: 'Waiting for transfer · expires in 6 h', tone: 'warning' },
    method: 'Bank transfer',
    amountKobo: 5_200_000,
    feeKobo: null,
    status: 'PENDING',
  },
  {
    when: '13 Nov 16:06',
    order: '#OJ-1045',
    customer: 'Efe Okoro',
    method: 'USSD *737#',
    amountKobo: 2_400_000,
    feeKobo: 46_000,
    status: 'SUCCESSFUL',
  },
  {
    when: '13 Nov 11:31',
    order: '#OJ-1044',
    customer: 'Ngozi Eze',
    note: { text: 'Declined: insufficient funds', tone: 'danger' },
    method: 'Card ••9013',
    amountKobo: 950_000,
    feeKobo: null,
    status: 'FAILED',
  },
  {
    when: '12 Nov 14:49',
    order: '#OJ-1043',
    customer: 'Ibrahim Musa',
    method: 'Bank transfer',
    amountKobo: 4_100_000,
    feeKobo: 71_500,
    status: 'SUCCESSFUL',
  },
  {
    when: '10 Nov 13:41',
    order: '#OJ-1040',
    customer: 'Kelechi Nwosu',
    note: { text: 'Refunded 11 Nov · item damaged', tone: 'muted' },
    method: 'Card ••5528',
    amountKobo: 3_300_000,
    feeKobo: 59_500,
    status: 'REFUNDED',
  },
];

export const PAYOUTS = [
  { date: 'Mon 17 Nov', reference: 'Scheduled', payments: 3, amountKobo: 7_250_000, sent: false },
  {
    date: 'Fri 14 Nov',
    reference: 'PSTK-PO-88231',
    payments: 2,
    amountKobo: 6_309_500,
    sent: true,
  },
  {
    date: 'Thu 13 Nov',
    reference: 'PSTK-PO-87904',
    payments: 4,
    amountKobo: 9_870_000,
    sent: true,
  },
  {
    date: 'Wed 12 Nov',
    reference: 'PSTK-PO-87655',
    payments: 3,
    amountKobo: 8_102_500,
    sent: true,
  },
  {
    date: 'Mon 10 Nov',
    reference: 'PSTK-PO-87120',
    payments: 6,
    amountKobo: 15_640_000,
    sent: true,
  },
];

export const PAYOUT_ACCOUNT = { bank: 'GTBank', last4: '6789', holder: 'ADÙNNÍ OGUNLEYE' };

/* ----------------------------------------------------------------------------- 03.13 Domains */

export const DNS_RECORDS = [
  { type: 'A', host: '@', value: '76.223.105.230', ttl: 'Auto', found: true },
  { type: 'CNAME', host: 'www', value: 'stores.ojara.app', ttl: 'Auto', found: false },
];

export const DNS_GUIDES = ['Whogohost', 'Qservers', 'GoDaddy', 'Namecheap'];

/* -------------------------------------------------------------------------------- 03.14 Help */

export const HELP_POPULAR = ['Payouts', 'Delivery zones', 'Custom domain', 'Refunds'];

export const HELP_GUIDES = [
  {
    title: 'Add products that sell',
    body: 'Photos, prices and variants · 4 min read',
    icon: 'package',
  },
  { title: 'Get paid with Paystack', body: 'Bank details and payouts · 3 min read', icon: 'card' },
  { title: 'Set delivery zones', body: 'Charges customers see · 3 min read', icon: 'truck' },
  { title: 'Use your own domain', body: 'DNS made simple · 6 min read', icon: 'globe' },
] as const;

export const HELP_FAQS = [
  {
    q: 'When do I get paid?',
    a: 'Paystack sends your money to your bank the next business day after a successful payment, minus Paystack’s fee. You can see every payout under Payments.',
  },
  {
    q: 'Why was a customer’s payment declined?',
    a: 'Usually the customer’s bank declined it: insufficient funds, a card limit or a failed OTP. The reason shows on the transaction under Payments, and you can send them a fresh payment link.',
  },
  {
    q: 'How do I close my store for a holiday?',
    a: 'Go to Storefront and switch off “Store is open”, or use Settings › Store details › Close store. Customers see a “back soon” page and orders already placed stay active.',
  },
  {
    q: 'Can I sell services or take bookings?',
    a: 'Not yet. Ojara is built for physical products you deliver or customers pick up. Bookings are on our list.',
  },
  {
    q: 'What can’t I sell on Ojara?',
    a: 'Weapons, drugs, counterfeit goods, live animals and anything illegal in Nigeria. See the Prohibited products policy for the full list.',
  },
];

export const SUPPORT_CHANNELS = [
  {
    title: 'Chat on WhatsApp',
    body: 'Usually replies in 10 min · 8am–8pm daily',
    icon: 'whatsapp',
  },
  { title: 'Email support', body: 'support@ojara.store · within 24 h', icon: 'mail' },
  { title: 'Call us', body: '0700 OJARA 00 · Mon–Fri, 9am–5pm', icon: 'phone' },
] as const;

export const SUPPORT_REQUESTS = [
  {
    id: '#SUP-2041',
    title: 'adunnithreads.com isn’t connecting',
    status: 'Awaiting you',
    meta: 'Tolu from Ojara replied 2 h ago',
  },
];

/* ---------------------------------------------------------------------------- 03.16 Billing */

export const BILLING = {
  currentPlan: 'STARTER' as PlanKey,
  nextCharge: '15 Dec 2026',
  activeSince: '15 Nov 2026',
  card: { brand: 'Verve', last4: '3390', expires: '08/28' },
  receiptsTo: 'adunni@adunnithreads.com',
  usage: { products: 18, staff: 1, domains: 1 },
};

/** Plan card copy exactly as 03.16 (prices and limits come from PLANS). */
export const PLAN_CARD_COPY: Record<
  PlanKey,
  { tagline: string; features: { text: string; included: boolean }[] }
> = {
  FREE: {
    tagline: 'For trying Ojara out',
    features: [
      { text: '1 store, 20 products', included: false },
      { text: 'Ojara address', included: true },
      { text: 'Basic orders & inventory', included: true },
      { text: 'Ojara branding on store', included: true },
    ],
  },
  STARTER: {
    tagline: 'For growing sellers',
    features: [
      { text: '200 products', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Discounts & promo prices', included: true },
      { text: 'No Ojara branding', included: true },
      { text: 'Basic sales reports', included: true },
    ],
  },
  PROFESSIONAL: {
    tagline: 'For busy, established stores',
    features: [
      { text: 'Unlimited products (fair use)', included: true },
      { text: 'Staff accounts', included: true },
      { text: 'Advanced reports', included: true },
      { text: 'Customer notes & tags', included: true },
      { text: 'Priority support', included: true },
    ],
  },
};

export const INVOICES = [
  {
    number: 'INV-2026-0001',
    date: '15 Nov 2026',
    description: 'Starter · monthly',
    amountKobo: 500_000,
  },
];

/* ------------------------------------------------------------------------------ 03.17 Staff */

export const TEAM = [
  { name: 'Adùnní Ogunleye', email: 'adunni@adunnithreads.com', role: 'Owner', you: true },
];

export const ROLE_MATRIX: { action: string; owner: boolean; manager: boolean; packer: boolean }[] =
  [
    { action: 'Manage orders & fulfilment', owner: true, manager: true, packer: true },
    { action: 'Edit products & stock', owner: true, manager: true, packer: true },
    { action: 'See customers', owner: true, manager: true, packer: false },
    { action: 'See payments & payouts', owner: true, manager: false, packer: false },
    { action: 'Change plan, bank or domain', owner: true, manager: false, packer: false },
  ];

/* ---------------------------------------------------------------------- 03.18 Notifications */

export const MERCHANT_ALERTS = [
  { title: 'New paid order', body: 'As soon as Paystack confirms payment', email: true, sms: true },
  {
    title: 'Payment failed or pending',
    body: 'So you can follow up with the customer',
    email: true,
    sms: false,
  },
  { title: 'Low stock', body: 'When a variant reaches its alert level', email: true, sms: false },
  { title: 'Payout sent', body: 'When Paystack sends money to your bank', email: true, sms: false },
  {
    title: 'Weekly summary',
    body: 'Sales, top products and visits every Monday',
    email: true,
    sms: false,
  },
];

export const CUSTOMER_MESSAGES = [
  {
    title: 'Order confirmation',
    body: 'Receipt with items, total and delivery details',
    email: true,
    sms: true,
  },
  {
    title: 'Status updates',
    body: 'When you mark an order processing, shipped or delivered',
    email: true,
    sms: true,
  },
  {
    title: 'Pickup ready',
    body: 'When a pickup order is ready at your studio',
    email: true,
    sms: true,
  },
  {
    title: 'Payment link',
    body: 'When you resend a link after a failed payment',
    email: true,
    sms: false,
  },
];

/* --------------------------------------------------------------------------- 03.19 Policies */

export type PolicyKey = 'returns' | 'delivery' | 'privacy' | 'terms';

export const POLICIES: {
  key: PolicyKey;
  title: string;
  status: string;
  statusTone: 'muted' | 'warning';
  icon: 'returns' | 'delivery' | 'privacy' | 'terms';
  paragraphs: string[];
}[] = [
  {
    key: 'returns',
    title: 'Returns & exchanges',
    status: 'Published · 7-day returns',
    statusTone: 'muted',
    icon: 'returns',
    paragraphs: [
      'We want you to love what you buy. If something isn’t right, message us on WhatsApp within 7 days of delivery and we’ll sort it out.',
      'Items must be unworn, unwashed and in their original packaging. Because every adire piece is hand-dyed, small differences in pattern are not a fault.',
      'Exchanges are free for faulty items. For change-of-mind returns, you cover the delivery back to our Surulere studio. Refunds go back to your original payment method within 5 business days of us receiving the item.',
      'Headwraps (gele) and custom orders can’t be returned unless faulty.',
    ],
  },
  {
    key: 'delivery',
    title: 'Delivery',
    status: 'Auto-filled from your zones',
    statusTone: 'muted',
    icon: 'delivery',
    paragraphs: [
      'We deliver across Lagos in 1–3 days and nationwide by courier in 3–5 days. Delivery charges are shown at checkout before you pay.',
      'Delivery is free in Lagos zones on orders over ₦40,000. You can also pick up from our Surulere studio, Mon–Sat, 10am – 6pm.',
      'Orders paid before 2:00pm are usually ready to send the same business day. You’ll get an SMS with your rider’s number when your order leaves the studio.',
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy',
    status: 'Ojara template',
    statusTone: 'muted',
    icon: 'privacy',
    paragraphs: [
      'We collect only what we need to deliver your order: your name, phone number, email and delivery address.',
      'Payments are processed by Paystack. We never see or store your full card details.',
      'We don’t sell your information. We use it to process your order and, if you agree, to tell you about new pieces.',
    ],
  },
  {
    key: 'terms',
    title: 'Terms of sale',
    status: 'Not set yet',
    statusTone: 'warning',
    icon: 'terms',
    paragraphs: [],
  },
];

export const RETURN_SETTINGS = {
  window: [
    '7 days after delivery',
    '14 days after delivery',
    '30 days after delivery',
    'No returns',
  ],
  whoPays: ['Customer, unless item is faulty', 'Store always pays', 'Customer always pays'],
  refundMethod: ['Back to original payment', 'Store credit', 'Exchange only'],
};

export const PLATFORM_POLICIES = ['Seller Policy', 'Prohibited products', 'Customer data handling'];
