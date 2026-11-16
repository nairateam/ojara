/**
 * Sample content for the public marketing site (01.01–01.07). Copy is taken verbatim from the
 * designs; money is integer kobo and formatted with `formatKobo` at render time.
 */
import type { PlanKey } from '@ojara/shared';

export type IconName =
  | 'shirt'
  | 'sparkles'
  | 'cookie'
  | 'smartphone'
  | 'sofa'
  | 'gift'
  | 'shopping-bag'
  | 'boxes'
  | 'credit-card'
  | 'bell'
  | 'package-check'
  | 'landmark'
  | 'rocket'
  | 'package'
  | 'truck'
  | 'layers'
  | 'globe'
  | 'package-search'
  | 'message-circle'
  | 'flag'
  | 'receipt';

/* ------------------------------------------------------------------ 01.01 Home */

export const SELLER_CATEGORIES: { label: string; icon: IconName }[] = [
  { label: 'Fashion', icon: 'shirt' },
  { label: 'Beauty & skincare', icon: 'sparkles' },
  { label: 'Food & snacks', icon: 'cookie' },
  { label: 'Gadgets', icon: 'smartphone' },
  { label: 'Home & décor', icon: 'sofa' },
  { label: 'Gifts & crafts', icon: 'gift' },
];

export const HERO_ORDER = {
  title: 'New paid order',
  amountKobo: 3_650_000,
  customer: 'Chiamaka O.',
  area: 'Yaba',
  when: 'just now',
};
export const HERO_PAYOUT_KOBO = 11_830_000;

export const DM_COMPARISON: { before: string; after: string }[] = [
  {
    before: '“Is this still available?” — 40 times a day',
    after: 'Customers see live stock. Sold-out sizes can’t be picked.',
  },
  {
    before: '“Send me your account number” and waiting for proof of payment',
    after: 'Paystack checkout by card, transfer or USSD. You’re told the moment it’s paid.',
  },
  {
    before: 'Orders buried between voice notes',
    after: 'Every order in one list, with paid and delivered status side by side.',
  },
  {
    before: 'Your page looks like everyone else’s',
    after: 'Your own store, logo and web address — even your own .com on Starter.',
  },
];

/** Mobile (01.07) condensed version of the comparison. */
export const DM_COMPARISON_MOBILE = [
  { title: 'Live stock', body: 'No more “is this still available?”' },
  { title: 'Paystack checkout', body: 'No more chasing proof of payment' },
  { title: 'One order list', body: 'No more orders lost in voice notes' },
];

export const SHOWCASE_FEATURES: { title: string; body: string; icon: IconName }[] = [
  {
    title: 'Orders',
    body: 'Paid and delivery status side by side, so nothing slips.',
    icon: 'shopping-bag',
  },
  {
    title: 'Stock',
    body: 'Sells down automatically. Low-stock alerts before you run out.',
    icon: 'boxes',
  },
  {
    title: 'Payments',
    body: 'Paystack sends money to your bank the next business day.',
    icon: 'credit-card',
  },
];

export const HOME_STEPS = [
  {
    title: 'Tell us about your business',
    body: 'Name, what you sell and where you’re based. Two minutes.',
  },
  {
    title: 'Add products from your phone',
    body: 'Snap photos, set prices, sizes and stock. Start with three.',
  },
  {
    title: 'Connect Paystack & delivery',
    body: 'Your bank for payouts, your zones and charges for delivery.',
  },
  {
    title: 'Share your link',
    body: 'Put it in your Instagram bio and WhatsApp status. Orders arrive paid.',
  },
];

export const MERCHANT_STORY = {
  quote:
    'I used to lose half my orders in Instagram DMs. Now customers pay before I even wake up — and I know exactly what to pack.',
  name: 'Adùnní Ogunleye',
  role: 'Founder, Adùnní Threads · Lagos',
  initial: 'A',
  photo: '/mock/generated-6.jpg',
  stats: [
    { value: '86', label: 'paid orders in 30 days' },
    { value: '8 min', label: 'to set up her store' },
    { value: '₦1.28M', label: 'sales last month' },
  ],
};

/** Short plan summaries for the home pricing teaser. */
export const PLAN_TEASERS: Record<PlanKey, { summary: string; mobileSummary: string }> = {
  FREE: { summary: '20 products · Ojara address', mobileSummary: '20 products' },
  STARTER: {
    summary: '200 products · your own domain',
    mobileSummary: '200 products · own domain',
  },
  PROFESSIONAL: { summary: 'Unlimited* · staff accounts', mobileSummary: 'Unlimited* · staff' },
};

/* ---------------------------------------------------------- 01.02 How it works */

export const ONBOARDING_STEPS = [
  {
    title: 'Tell us about your business',
    body: 'Name, what you sell and where. We set your currency and delivery defaults.',
    screen: '/mock/screens/onboarding-1.png',
  },
  {
    title: 'Name your store and pick a look',
    body: 'Choose your web address, upload a logo and a brand colour.',
    screen: '/mock/screens/onboarding-2.png',
  },
  {
    title: 'Add your first products',
    body: 'Photos from your phone, prices, sizes and stock. Three is enough to start.',
    screen: '/mock/screens/onboarding-3.png',
  },
  {
    title: 'Connect Paystack',
    body: 'Add your bank account. Paystack pays you the next business day.',
    screen: '/mock/screens/onboarding-4.png',
  },
  {
    title: 'Set delivery & pickup',
    body: 'Zones and charges customers see at checkout. You arrange the rider.',
    screen: '/mock/screens/onboarding-5.png',
  },
  {
    title: 'Publish and share',
    body: 'Check everything, press publish, then share your link everywhere.',
    screen: '/mock/screens/onboarding-6.png',
  },
];

export const DAY_ON_OJARA: { time: string; title: string; body: string; icon: IconName }[] = [
  {
    time: '7:30am',
    title: 'Paid orders are waiting',
    body: 'Customers ordered overnight. Each one shows paid or not, and where it’s going.',
    icon: 'bell',
  },
  {
    time: '10:00am',
    title: 'Pack and mark ready',
    body: 'Tap “ready for dispatch”. The customer gets an SMS automatically.',
    icon: 'package-check',
  },
  {
    time: '2:00pm',
    title: 'Stock looks after itself',
    body: 'Sold items come off stock. You get a nudge before a size runs out.',
    icon: 'boxes',
  },
  {
    time: 'Next day',
    title: 'Money in your bank',
    body: 'Paystack pays out yesterday’s sales, minus its fee. No chasing transfers.',
    icon: 'landmark',
  },
];

export type Faq = { q: string; a: string };

export const HOW_IT_WORKS_FAQ: Faq[] = [
  {
    q: 'Do I need a website or a developer?',
    a: 'No. If you can post on Instagram, you can set up an Ojara store from your phone.',
  },
  {
    q: 'Can I run everything from my phone?',
    a: 'Yes. Orders, stock and payouts all work on mobile — most sellers never open a laptop.',
  },
  {
    q: 'What if I already sell on WhatsApp?',
    a: 'Keep doing it. Share your store link in chats and your status, and let customers pay themselves.',
  },
  {
    q: 'What does it cost?',
    a: '₦0 to start with up to 20 products. Paystack’s fee applies to each payment. Upgrade only when you need more.',
  },
];

/* --------------------------------------------------------- 01.03 Stores on Ojara */

/** Directory category chips (12 Stores). "All" clears the filter. */
export const STORE_FILTERS = [
  'All',
  'Fashion',
  'Beauty',
  'Food & groceries',
  'Gadgets',
  'Home & décor',
  'Fabrics & crafts',
  'Accessories',
] as const;

export type StoreCategory = Exclude<(typeof STORE_FILTERS)[number], 'All'>;

/** Store of the month. Its "Visit store" button opens the demo store. */
export const FEATURED_STORE = {
  name: 'Adùnní Threads',
  initial: 'A',
  initials: 'AT',
  meta: 'Fashion · Ibadan',
  city: 'Ibadan',
  month: 'November',
  description:
    'Hand-dyed adire and aso-oke from Abeokuta. Every piece is one of a kind, and ships across Nigeria.',
  quote:
    '“I used to spend my evenings answering ‘how much?’ in DMs. Now I send one link, and the orders just come in.”',
  metrics: [
    { value: '3.2×', label: 'more orders in 90 days' },
    { value: '146', label: 'products listed' },
    { value: '4.9', label: 'average rating' },
  ],
  host: 'adunni.ojara.store',
  heroImage: '/mock/generated-6.jpg',
};

export type DirectoryStore = {
  name: string;
  /** Two-letter monogram on the avatar. */
  initials: string;
  category: StoreCategory;
  city: string;
  productCount: number;
  /** Not shown on the card; searched along with name, category and city. */
  description: string;
  cover: string;
  host: string;
};

/** In "Most popular" order. */
export const DIRECTORY_STORES: DirectoryStore[] = [
  {
    name: 'Kaftan House',
    initials: 'KH',
    category: 'Fashion',
    city: 'Lagos',
    productCount: 84,
    description: 'Men’s kaftans and agbada, tailored to your measurements.',
    cover: '/mock/generated-3.jpg',
    host: 'kaftanhouse.ojara.store',
  },
  {
    name: 'Gele by Bimpe',
    initials: 'GB',
    category: 'Fabrics & crafts',
    city: 'Abeokuta',
    productCount: 52,
    description: 'Aso-oke gele, auto-gele and headwraps for every occasion.',
    cover: '/mock/generated-2.jpg',
    host: 'gelebybimpe.ojara.store',
  },
  {
    name: 'Mama Nkechi',
    initials: 'MN',
    category: 'Fashion',
    city: 'Enugu',
    productCount: 117,
    description: 'Ankara dresses and two-pieces, sewn to order.',
    cover: '/mock/generated-9.jpg',
    host: 'mamankechi.ojara.store',
  },
  {
    name: 'glow by temi',
    initials: 'GT',
    category: 'Beauty',
    city: 'Lagos',
    productCount: 63,
    description: 'Raw shea butter, black soap and body oils, made in small batches.',
    cover: '/mock/generated-17.jpg',
    host: 'glowbytemi.ojara.store',
  },
  {
    name: 'Ikeja Plug',
    initials: 'IP',
    category: 'Gadgets',
    city: 'Lagos',
    productCount: 210,
    description: 'Chargers, power banks and earbuds with 3-month warranty.',
    cover: '/mock/generated-15.jpg',
    host: 'ikejaplug.ojara.store',
  },
  {
    name: 'Lush Home NG',
    initials: 'LH',
    category: 'Home & décor',
    city: 'Abuja',
    productCount: 98,
    description: 'Woven baskets, throw pillows and décor with African prints.',
    cover: '/mock/generated-18.jpg',
    host: 'lushhome.ojara.store',
  },
  {
    name: 'Zaria Spice House',
    initials: 'ZS',
    category: 'Food & groceries',
    city: 'Kano',
    productCount: 45,
    description: 'Pepper blends, suya spice, chin-chin and garri, packed fresh.',
    cover: '/mock/generated-16.jpg',
    host: 'zariaspice.ojara.store',
  },
  {
    name: 'Ankara & Co',
    initials: 'AC',
    category: 'Accessories',
    city: 'Port Harcourt',
    productCount: 38,
    description: 'Ankara bucket hats, bags and hair accessories.',
    cover: '/mock/generated-1.jpg',
    host: 'ankaraandco.ojara.store',
  },
  {
    name: 'Ọ̀ṣun Bags',
    initials: 'OB',
    category: 'Accessories',
    city: 'Ibadan',
    productCount: 29,
    description: 'Handwoven clutches and purses in aso-oke and leather.',
    cover: '/mock/generated-7.jpg',
    host: 'osunbags.ojara.store',
  },
];

export const DIRECTORY_TOTAL = 1562;

/* ---------------------------------------------------------------- 01.04 Pricing */

export const PLAN_CTAS: Record<PlanKey, string> = {
  FREE: 'Start free',
  STARTER: 'Start with Starter',
  PROFESSIONAL: 'Go Professional',
};

export const PLAN_FEATURES: Record<PlanKey, { label: string; included: boolean }[]> = {
  FREE: [
    { label: '1 online store', included: true },
    { label: 'Up to 20 products', included: true },
    { label: 'yourname.ojara.store address', included: true },
    { label: 'Orders, stock & delivery tools', included: true },
    { label: 'Paystack checkout', included: true },
    { label: '“Powered by Ojara” on your store', included: false },
  ],
  STARTER: [
    { label: 'Everything in Free', included: true },
    { label: 'Up to 200 products', included: true },
    { label: 'Your own domain (.com, .ng)', included: true },
    { label: 'Discounts & sale prices', included: true },
    { label: 'No Ojara branding', included: true },
    { label: 'Sales reports', included: true },
  ],
  PROFESSIONAL: [
    { label: 'Everything in Starter', included: true },
    { label: 'Unlimited products (fair use)', included: true },
    { label: 'Staff accounts', included: true },
    { label: 'Advanced reports', included: true },
    { label: 'Customer notes & tags', included: true },
    { label: 'Priority support', included: true },
  ],
};

export const PRICING_FAQ: Faq[] = [
  {
    q: 'Do you take a cut of my sales?',
    a: 'No. Ojara only charges the plan price. Paystack charges its own payment fee on each sale, which comes out of your payout.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes, any time. Upgrades start straight away. If you move down to Free, products above 20 are hidden, not deleted.',
  },
  {
    q: 'How do customers pay?',
    a: 'By card, bank transfer or USSD through Paystack. They don’t need an account.',
  },
  {
    q: 'Who delivers my orders?',
    a: 'You do, with your own rider or courier. You set delivery zones and charges, and Ojara keeps customers updated.',
  },
];

/* ------------------------------------------------------------ 01.05 Help centre */

export type HelpTopic = {
  slug: string;
  title: string;
  description: string;
  articleCount: number;
  icon: IconName;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'Sign up, set up and publish your store',
    articleCount: 12,
    icon: 'rocket',
  },
  {
    slug: 'products-and-stock',
    title: 'Products & stock',
    description: 'Photos, variants, prices and inventory',
    articleCount: 18,
    icon: 'package',
  },
  {
    slug: 'orders-and-delivery',
    title: 'Orders & delivery',
    description: 'Fulfilment, zones, pickup and tracking',
    articleCount: 15,
    icon: 'truck',
  },
  {
    slug: 'payments-and-payouts',
    title: 'Payments & payouts',
    description: 'Paystack, fees, refunds and failed payments',
    articleCount: 11,
    icon: 'credit-card',
  },
  {
    slug: 'plans-and-billing',
    title: 'Plans & billing',
    description: 'Free, Starter, Professional and invoices',
    articleCount: 8,
    icon: 'layers',
  },
  {
    slug: 'domains-and-branding',
    title: 'Domains & branding',
    description: 'Your web address, logo and storefront',
    articleCount: 7,
    icon: 'globe',
  },
];

export type HelpArticleLink = { slug: string; title: string };

export const POPULAR_ARTICLES: HelpArticleLink[] = [
  { slug: 'how-paystack-payouts-work', title: 'How Paystack payouts work' },
  { slug: 'delivery-zones-and-charges', title: 'Set up delivery zones and charges' },
  { slug: 'why-did-a-payment-fail', title: 'Why did a customer’s payment fail?' },
  { slug: 'sizes-and-colours', title: 'Add sizes and colours to a product' },
  { slug: 'connect-your-own-domain', title: 'Connect your own domain' },
  { slug: 'close-your-store-for-a-holiday', title: 'Close your store for a holiday' },
];

export const SHOPPER_HELP: { title: string; body: string; icon: IconName }[] = [
  {
    title: 'Track your order',
    body: 'Use the link in your SMS or the store’s Track order page',
    icon: 'package-search',
  },
  {
    title: 'Contact the store',
    body: 'Their WhatsApp is in every store footer',
    icon: 'message-circle',
  },
  {
    title: 'Report a store',
    body: 'If something isn’t right, tell Ojara — we review every report',
    icon: 'flag',
  },
];

export const SUPPORT = {
  whatsapp: 'https://wa.me/2348000000000',
  email: 'mailto:help@ojara.store',
  status: 'All systems normal · replies in ~10 min, 8am–8pm',
};

/* ------------------------------------------------------------ 01.06 Help article */

export type HelpArticleBlock = { type: 'p'; text: string } | { type: 'callout'; text: string };

export type HelpArticle = {
  slug: string;
  topic: string;
  title: string;
  meta: string;
  lead: string;
  /** Customer pays → Paystack fee → your bank, in kobo. */
  flow?: { paidKobo: number; feeKobo: number };
  sections: { id: string; heading: string; blocks: HelpArticleBlock[] }[];
};

export const PAYMENTS_TOPIC_ARTICLES: HelpArticleLink[] = [
  { slug: 'connect-paystack', title: 'Connect Paystack to your store' },
  { slug: 'how-paystack-payouts-work', title: 'How Paystack payouts work' },
  { slug: 'paystack-fees-explained', title: 'Paystack fees explained' },
  { slug: 'why-did-a-payment-fail', title: 'Why did a customer’s payment fail?' },
  { slug: 'refund-a-customer', title: 'Refund a customer' },
  { slug: 'pending-bank-transfers', title: 'Pending bank transfers' },
  { slug: 'change-payout-bank-account', title: 'Change your payout bank account' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-paystack-payouts-work',
    topic: 'Payments & payouts',
    title: 'How Paystack payouts work',
    meta: '3 min read · Updated 12 November 2026',
    lead: 'When a customer pays on your store, the money goes to Paystack first. Paystack takes its fee and sends the rest to your bank account — Ojara never holds your money.',
    flow: { paidKobo: 2_700_000, feeKobo: 50_500 },
    sections: [
      {
        id: 'when-will-i-get-paid',
        heading: 'When will I get paid?',
        blocks: [
          {
            type: 'p',
            text: 'Payouts arrive the next business day after a successful payment. Money from a Friday, Saturday or Sunday sale arrives on Monday. Public holidays push payouts to the next working day.',
          },
        ],
      },
      {
        id: 'what-does-paystack-charge',
        heading: 'What does Paystack charge?',
        blocks: [
          {
            type: 'p',
            text: 'For local cards, transfers and USSD, Paystack charges 1.5% + ₦100 per payment. The ₦100 is waived for payments under ₦2,500, and the fee is capped at ₦2,000. Ojara adds nothing on top.',
          },
          {
            type: 'callout',
            text: 'Your Ojara plan (Starter or Professional) is billed separately to your card. It is never taken out of your payouts.',
          },
        ],
      },
      {
        id: 'where-can-i-see-my-payouts',
        heading: 'Where can I see my payouts?',
        blocks: [
          {
            type: 'p',
            text: 'Go to Payments in your dashboard. You’ll see every customer payment, the Paystack fee on each one, and when each payout reached your bank.',
          },
        ],
      },
    ],
  },
];
