import { formatKobo, type PlanKey, type StoreStatus } from '@ojara/shared';

/**
 * Sample data for the platform admin console (06.01–06.10). Money is integer kobo
 * (₦1 = 100 kobo). Replace with GET /v1/admin/* once those endpoints exist.
 */

const M = 100_000_000; // ₦1M in kobo
const N = 100; // ₦1 in kobo

export const ADMIN_ACCOUNT = { name: 'Kemi Adebayo', firstName: 'Kemi', role: 'Operations admin' };

/** Sidebar count pills (06.xx): Reports & abuse is red, Support tickets is muted. */
export const ADMIN_NAV_COUNTS: Record<string, { count: number; tone?: 'danger' }> = {
  '/reports': { count: 3, tone: 'danger' },
  '/support': { count: 12 },
};

export type Tone = 'success' | 'danger' | 'muted' | 'default';

export interface AdminKpi {
  label: string;
  value: string;
  note?: string;
  noteTone?: Tone;
  valueTone?: 'danger';
}

/* ───────────────────────────── 06.01 Overview ───────────────────────────── */

export const OVERVIEW = {
  subtitle: 'Platform health for November 2026 · updated 2 min ago',
  kpis: [
    {
      label: 'Monthly recurring revenue',
      value: '₦1,915,000',
      note: '+8.1% vs October',
      noteTone: 'success',
    },
    { label: 'New merchants', value: '184', note: '+12% vs October', noteTone: 'success' },
    { label: 'Free → paid', value: '12.9%', note: '312 paying of 2,418', noteTone: 'muted' },
    { label: 'Store sales (GMV)', value: '₦184.2M', note: 'last 30 days', noteTone: 'muted' },
    { label: 'Payment success', value: '94.2%', note: '−0.6 pts · USSD dip', noteTone: 'danger' },
  ] satisfies AdminKpi[],
  /** Stacked MRR by month: Professional on top, Starter below. */
  mrr: [
    { month: 'Jun', starterKobo: 0.6 * M, proKobo: 0.32 * M },
    { month: 'Jul', starterKobo: 0.71 * M, proKobo: 0.4 * M },
    { month: 'Aug', starterKobo: 0.85 * M, proKobo: 0.49 * M },
    { month: 'Sep', starterKobo: 0.97 * M, proKobo: 0.55 * M },
    { month: 'Oct', starterKobo: 1.13 * M, proKobo: 0.64 * M },
    { month: 'Nov', starterKobo: 1.205 * M, proKobo: 0.71 * M },
  ],
  funnel: {
    subtitle: '184 sign-ups in November',
    stages: [
      { label: 'Signed up', count: 184, pct: 100, tone: 'forest' },
      { label: 'Finished onboarding', count: 131, pct: 71, tone: 'forest' },
      { label: 'Published store', count: 112, pct: 61, tone: 'forest' },
      { label: 'Got first paid order', count: 64, pct: 35, tone: 'muted' },
      { label: 'Upgraded to paid', count: 11, pct: 6, tone: 'success' },
    ] as const,
  },
  experience: [
    { label: 'Checkout completion', value: '61%', note: 'Target 60%', noteTone: 'success' },
    {
      label: 'Median support reply',
      value: '14 min',
      note: 'Target < 30 min',
      noteTone: 'success',
    },
    { label: 'Merchant churn', value: '3.2%', note: 'per month', noteTone: 'muted' },
    { label: 'Avg setup time', value: '8 min 40 s', note: 'to publish', noteTone: 'success' },
  ] satisfies AdminKpi[],
  needsAPerson: [
    {
      kind: 'abuse',
      title: '3 open abuse reports',
      body: 'Oldest: Gadget Hub Ikeja · 2 days',
      href: '/reports',
    },
    {
      kind: 'support',
      title: '12 support tickets',
      body: '4 waiting over 2 hours',
      href: '/support',
    },
    {
      kind: 'billing',
      title: '5 failed plan renewals',
      body: 'Cards declined · retry tonight',
      href: '/subscriptions?tab=past-due',
    },
  ] as const,
};

/* ───────────────────────────── 06.02 Merchants ──────────────────────────── */

export interface AdminMerchant {
  id: string;
  store: string;
  domain: string;
  owner: string;
  plan: PlanKey;
  status: StoreStatus;
  products: number;
  /** null = no sales yet (shown as an em dash). */
  gmv30dKobo: number | null;
  logoColor: string;
  category: string;
  city: string;
}

export const MERCHANTS: AdminMerchant[] = [
  {
    id: 'glow-by-temi',
    store: 'Glow by Temi',
    domain: 'glowbytemi.com',
    owner: 'Temi Ajayi',
    plan: 'PROFESSIONAL',
    status: 'PUBLISHED',
    products: 412,
    gmv30dKobo: 6.9 * M,
    logoColor: '#8A3D6B',
    category: 'Beauty & skincare',
    city: 'Lagos',
  },
  {
    id: 'lush-home-ng',
    store: 'Lush Home NG',
    domain: 'lushhome.ng',
    owner: 'Ifeoma Okafor',
    plan: 'PROFESSIONAL',
    status: 'PUBLISHED',
    products: 286,
    gmv30dKobo: 4.1 * M,
    logoColor: '#2F5D46',
    category: 'Home & living',
    city: 'Abuja',
  },
  {
    id: 'bayos-sneakers',
    store: 'Bayo’s Sneakers',
    domain: 'bayosneakers.ojara.store',
    owner: 'Bayo Lawal',
    plan: 'STARTER',
    status: 'PUBLISHED',
    products: 92,
    gmv30dKobo: 3.3 * M,
    logoColor: '#1C1B18',
    category: 'Shoes',
    city: 'Lagos',
  },
  {
    id: 'mama-nkechi-foods',
    store: 'Mama Nkechi Foods',
    domain: 'mamankechi.ojara.store',
    owner: 'Nkechi Udo',
    plan: 'STARTER',
    status: 'PUBLISHED',
    products: 64,
    gmv30dKobo: 2.4 * M,
    logoColor: '#B5532E',
    category: 'Food & groceries',
    city: 'Port Harcourt',
  },
  {
    id: 'adunni-threads',
    store: 'Adùnní Threads',
    domain: 'adunni.ojara.store',
    owner: 'Adùnní Ogunleye',
    plan: 'STARTER',
    status: 'PUBLISHED',
    products: 18,
    gmv30dKobo: 1_284_500 * N,
    logoColor: '#2A3A7C',
    category: 'Fashion & clothing',
    city: 'Lagos',
  },
  {
    id: 'gadget-hub-ikeja',
    store: 'Gadget Hub Ikeja',
    domain: 'gadgethub.ojara.store',
    owner: 'Samuel Ojo',
    plan: 'STARTER',
    status: 'SUSPENDED',
    products: 137,
    gmv30dKobo: 0,
    logoColor: '#4B5563',
    category: 'Phones & electronics',
    city: 'Lagos',
  },
  {
    id: 'kano-leather-co',
    store: 'Kano Leather Co.',
    domain: 'kanoleather.ojara.store',
    owner: 'Abubakar Sani',
    plan: 'FREE',
    status: 'DRAFT',
    products: 4,
    gmv30dKobo: null,
    logoColor: '#8B5E34',
    category: 'Bags & leather',
    city: 'Kano',
  },
  {
    id: 'zainab-scents',
    store: 'Zainab Scents',
    domain: 'zainabscents.ojara.store',
    owner: 'Zainab Yusuf',
    plan: 'FREE',
    status: 'DISABLED',
    products: 7,
    gmv30dKobo: null,
    logoColor: '#6B4FA0',
    category: 'Beauty & skincare',
    city: 'Kaduna',
  },
];

export const MERCHANTS_TOTAL = 2418;

export const MERCHANT_KPIS: AdminKpi[] = [
  { label: 'Registered merchants', value: '2,418', note: '+184 this month', noteTone: 'success' },
  { label: 'Published stores', value: '1,562', note: '64.6% of registered', noteTone: 'muted' },
  { label: 'Paying merchants', value: '312', note: '12.9% free → paid', noteTone: 'success' },
  { label: 'MRR', value: '₦1,915,000', note: '+8.1% vs October', noteTone: 'success' },
  { label: 'Monthly churn', value: '3.2%', note: '−0.4 pts', noteTone: 'success' },
];

export const REVIEW_QUEUE = [
  {
    caseId: 'ABU-0193',
    store: 'Gadget Hub Ikeja',
    reason: 'Possible counterfeit phones · 4 shopper reports',
    state: 'Suspended pending review',
  },
  {
    caseId: 'ABU-0194',
    store: 'Quick Cash Deals',
    reason: 'Auto-flagged: lending is a prohibited category',
    state: 'New store, not yet published',
  },
  {
    caseId: 'ABU-0189',
    store: 'Royal Hair Empire',
    reason: '2 complaints: paid orders not delivered',
    state: 'Merchant asked to respond in 48 h',
  },
];

export const PLAN_MIX = {
  rows: [
    { plan: 'FREE' as PlanKey, count: 2106, pct: '87.1%', color: '#C4C9B6' },
    { plan: 'STARTER' as PlanKey, count: 241, pct: '10%', color: '#2C66A8' },
    { plan: 'PROFESSIONAL' as PlanKey, count: 71, pct: '2.9%', color: '#333A2F' },
  ],
  insight: '38 Free stores hit the 20-product cap this month — a good list for upgrade outreach.',
};

/* ─────────────────────────── 06.03 Merchant detail ──────────────────────── */

export interface MerchantDetail {
  merchant: AdminMerchant;
  logo: { bg: string; ink: string };
  customDomain?: string;
  kpis: AdminKpi[];
  account: { label: string; value: string }[];
  invoices: { number: string; date: string; description: string; amountKobo: number }[];
  activity: {
    icon: 'ticket' | 'globe' | 'upgrade' | 'orders' | 'card' | 'store';
    text: string;
    when: string;
  }[];
  notes: { body: string; author: string; date: string }[];
}

const ADUNNI_DETAIL: Omit<MerchantDetail, 'merchant'> = {
  logo: { bg: '#E9A23B', ink: '#14183A' },
  customDomain: 'adunnithreads.com (connecting)',
  kpis: [
    { label: 'Sales · 30 days', value: '₦1,284,500' },
    { label: 'Paid orders', value: '86' },
    { label: 'Products', value: '18 of 200' },
    { label: 'Payment success', value: '96.6%' },
    { label: 'Customer complaints', value: '0' },
  ],
  account: [
    { label: 'Owner', value: 'Adùnní Ogunleye' },
    { label: 'Joined', value: '4 Mar 2026' },
    { label: 'Email', value: 'adunni@adunnithreads.com' },
    { label: 'Phone', value: '+234 803 555 0144' },
    { label: 'Payouts', value: 'Paystack · GTBank ••6789' },
    { label: 'Onboarding', value: 'Finished in 8 min' },
    { label: 'Subscription', value: 'Starter since 15 Nov · renews 15 Dec' },
    { label: 'Billing card', value: 'Verve ••3390' },
  ],
  invoices: [
    {
      number: 'INV-2026-0001',
      date: '15 Nov 2026',
      description: 'Starter monthly',
      amountKobo: 5_000 * N,
    },
  ],
  activity: [
    { icon: 'ticket', text: 'Opened ticket #SUP-2041 · domain', when: 'Today 10:20' },
    { icon: 'globe', text: 'Added adunnithreads.com', when: 'Today 10:02' },
    { icon: 'upgrade', text: 'Upgraded Free → Starter', when: 'Today 09:58' },
    { icon: 'orders', text: 'Reached 80 paid orders', when: '12 Nov' },
    { icon: 'card', text: 'Connected Paystack', when: '4 Mar' },
    { icon: 'store', text: 'Published store', when: '4 Mar' },
  ],
  notes: [
    {
      body: 'Great case study for the fashion segment — asked if we can feature her on Instagram. Follow up after Black Friday.',
      author: 'Kemi A.',
      date: '12 Nov',
    },
  ],
};

/** Full detail exists for Adùnní Threads (the design); other stores get a derived summary. */
export function getMerchantDetail(id: string): MerchantDetail | undefined {
  const merchant = MERCHANTS.find((m) => m.id === id);
  if (!merchant) return undefined;
  if (id === 'adunni-threads') return { merchant, ...ADUNNI_DETAIL };
  const paid = merchant.plan !== 'FREE';
  const limit = { FREE: '20', STARTER: '200', PROFESSIONAL: '5,000' }[merchant.plan];
  return {
    merchant,
    logo: { bg: merchant.logoColor, ink: '#F5F6EE' },
    kpis: [
      {
        label: 'Sales · 30 days',
        value: formatKobo(merchant.gmv30dKobo ?? 0),
      },
      { label: 'Paid orders', value: merchant.gmv30dKobo ? '41' : '0' },
      { label: 'Products', value: `${merchant.products} of ${limit}` },
      { label: 'Payment success', value: merchant.gmv30dKobo ? '95.1%' : '—' },
      { label: 'Customer complaints', value: merchant.status === 'SUSPENDED' ? '4' : '0' },
    ],
    account: [
      { label: 'Owner', value: merchant.owner },
      { label: 'Joined', value: '12 Jun 2026' },
      { label: 'Email', value: `${merchant.owner.split(' ')[0]?.toLowerCase()}@gmail.com` },
      { label: 'Phone', value: '+234 805 210 4471' },
      { label: 'Payouts', value: paid ? 'Paystack · Access ••2210' : 'Paystack · not connected' },
      { label: 'Onboarding', value: merchant.status === 'DRAFT' ? 'In progress' : 'Finished' },
      {
        label: 'Subscription',
        value: paid
          ? `${merchant.plan === 'STARTER' ? 'Starter' : 'Professional'} monthly`
          : 'Free',
      },
      { label: 'Billing card', value: paid ? 'Visa ••2219' : '—' },
    ],
    invoices: paid
      ? [
          {
            number: 'INV-2026-0418',
            date: '1 Nov 2026',
            description: `${merchant.plan === 'STARTER' ? 'Starter' : 'Professional'} monthly`,
            amountKobo: (merchant.plan === 'STARTER' ? 5_000 : 10_000) * N,
          },
        ]
      : [],
    activity: [
      { icon: 'store', text: 'Published store', when: '12 Jun' },
      { icon: 'card', text: 'Connected Paystack', when: '12 Jun' },
    ],
    notes: [],
  };
}

/* ─────────────────────────── 06.04 Subscriptions ────────────────────────── */

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLING';

export interface AdminSubscription {
  merchantId: string;
  store: string;
  owner: string;
  plan: Exclude<PlanKey, 'FREE'>;
  status: SubscriptionStatus;
  amountKobo: number;
  renews: string;
  card: string;
}

export const SUBSCRIPTION_KPIS: AdminKpi[] = [
  {
    label: 'Paying merchants',
    value: '312',
    note: '241 Starter · 71 Professional',
    noteTone: 'muted',
  },
  { label: 'MRR', value: '₦1,915,000', note: '+₦140,000 this month', noteTone: 'success' },
  { label: 'Renewing in 7 days', value: '58', note: '₦345,000 expected', noteTone: 'muted' },
  {
    label: 'Past due',
    value: '5',
    valueTone: 'danger',
    note: '₦30,000 at risk',
    noteTone: 'danger',
  },
  { label: 'Cancelled this month', value: '10', note: '3.2% churn', noteTone: 'muted' },
];

export const SUBSCRIPTION_TABS = [
  { key: 'all', label: 'All', count: 312 },
  { key: 'active', label: 'Active', count: 300 },
  { key: 'past-due', label: 'Past due', count: 5 },
  { key: 'cancelling', label: 'Cancelling', count: 7 },
] as const;

export const SUBSCRIPTIONS: AdminSubscription[] = [
  {
    merchantId: 'glow-by-temi',
    store: 'Glow by Temi',
    owner: 'Temi Ajayi',
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    amountKobo: 10_000 * N,
    renews: '2 Dec',
    card: 'Mastercard ••1184',
  },
  {
    merchantId: 'lush-home-ng',
    store: 'Lush Home NG',
    owner: 'Ifeoma Okafor',
    plan: 'PROFESSIONAL',
    status: 'ACTIVE',
    amountKobo: 10_000 * N,
    renews: '9 Dec',
    card: 'Visa ••5530',
  },
  {
    merchantId: 'bayos-sneakers',
    store: 'Bayo’s Sneakers',
    owner: 'Bayo Lawal',
    plan: 'STARTER',
    status: 'PAST_DUE',
    amountKobo: 5_000 * N,
    renews: 'Card failed · retrying tonight',
    card: 'Verve ••0042',
  },
  {
    merchantId: 'mama-nkechi-foods',
    store: 'Mama Nkechi Foods',
    owner: 'Nkechi Udo',
    plan: 'STARTER',
    status: 'ACTIVE',
    amountKobo: 5_000 * N,
    renews: '20 Nov',
    card: 'Verve ••7781',
  },
  {
    merchantId: 'adunni-threads',
    store: 'Adùnní Threads',
    owner: 'Adùnní Ogunleye',
    plan: 'STARTER',
    status: 'ACTIVE',
    amountKobo: 5_000 * N,
    renews: '15 Dec',
    card: 'Verve ••3390',
  },
  {
    merchantId: 'gadget-hub-ikeja',
    store: 'Gadget Hub Ikeja',
    owner: 'Samuel Ojo',
    plan: 'STARTER',
    status: 'CANCELLING',
    amountKobo: 5_000 * N,
    renews: 'Ends 30 Nov',
    card: 'Visa ••2219',
  },
  {
    merchantId: 'royal-hair-empire',
    store: 'Royal Hair Empire',
    owner: 'Chidinma Eke',
    plan: 'STARTER',
    status: 'ACTIVE',
    amountKobo: 5_000 * N,
    renews: '1 Dec',
    card: 'Mastercard ••6604',
  },
  {
    merchantId: 'kiddies-corner-ibadan',
    store: 'Kiddies Corner Ibadan',
    owner: 'Toyin Alade',
    plan: 'STARTER',
    status: 'PAST_DUE',
    amountKobo: 5_000 * N,
    renews: 'Card failed · retrying tonight',
    card: 'Verve ••9917',
  },
];

/* ──────────────────────────────── 06.05 Plans ───────────────────────────── */

export type PlanCell =
  | { kind: 'input'; value: string; changed?: boolean }
  | { kind: 'toggle'; on: boolean }
  | { kind: 'select'; value: string; options: string[] };

export const PLAN_COLUMNS: { plan: PlanKey; stores: string }[] = [
  { plan: 'FREE', stores: '2,106 stores' },
  { plan: 'STARTER', stores: '241 stores' },
  { plan: 'PROFESSIONAL', stores: '71 stores' },
];

const REPORT_OPTIONS = ['Dashboard only', 'Basic', 'Advanced'];

export const PLAN_MATRIX: { feature: string; cells: [PlanCell, PlanCell, PlanCell] }[] = [
  {
    feature: 'Price per month',
    cells: [
      { kind: 'input', value: '₦0' },
      { kind: 'input', value: '₦5,000' },
      { kind: 'input', value: '₦10,000' },
    ],
  },
  {
    feature: 'Product limit',
    cells: [
      { kind: 'input', value: '20' },
      { kind: 'input', value: '200' },
      { kind: 'input', value: 'Unlimited*' },
    ],
  },
  {
    feature: 'Staff accounts',
    cells: [
      { kind: 'input', value: '1' },
      { kind: 'input', value: '2', changed: true },
      { kind: 'input', value: '5' },
    ],
  },
  {
    feature: 'Custom domain',
    cells: [
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: true },
      { kind: 'toggle', on: true },
    ],
  },
  {
    feature: 'Remove Ojara branding',
    cells: [
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: true },
      { kind: 'toggle', on: true },
    ],
  },
  {
    feature: 'Discounts & promo prices',
    cells: [
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: true },
      { kind: 'toggle', on: true },
    ],
  },
  {
    feature: 'Sales reports',
    cells: [
      { kind: 'select', value: 'Dashboard only', options: REPORT_OPTIONS },
      { kind: 'select', value: 'Basic', options: REPORT_OPTIONS },
      { kind: 'select', value: 'Advanced', options: REPORT_OPTIONS },
    ],
  },
  {
    feature: 'Customer notes & tags',
    cells: [
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: true },
    ],
  },
  {
    feature: 'Priority support',
    cells: [
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: false },
      { kind: 'toggle', on: true },
    ],
  },
];

export const PLAN_UNPUBLISHED = {
  title: '1 unpublished change',
  body: 'Starter staff accounts 1 → 2. Stores already on Starter get the new limit at their next renewal.',
};

export const PLAN_HISTORY = [
  { change: 'Professional products → Unlimited*', by: 'Kemi A. · 2 Nov' },
  { change: 'Starter price ₦4,000 → ₦5,000 (new subscribers)', by: 'Tobi O. · 1 Sep' },
  { change: 'Free product limit 10 → 20', by: 'Kemi A. · 15 Jul' },
];

/* ─────────────────────────── 06.06 Reports & abuse ──────────────────────── */

export interface AbuseCase {
  id: string;
  store: string;
  merchantId?: string;
  summary: string;
  meta: string;
  severity: 'High' | 'Medium';
  status: 'open' | 'resolved';
  badge: string;
  subtitle: string;
  /** Total reports; only the latest few are listed. */
  reportCount: number;
  reports: { quote: string; source: string }[];
  listings: { name: string; warning: string; priceKobo: number }[];
  options: { title: string; body: string }[];
}

const DEFAULT_OPTIONS = [
  {
    title: 'Keep suspended & ask for proof',
    body: 'Seller must upload supplier invoices within 72 h',
  },
  { title: 'Remove flagged listings only', body: 'Store reopens without the 2 listings' },
  { title: 'Restore store', body: 'Close the case with no action' },
];

export const ABUSE_CASES: AbuseCase[] = [
  {
    id: 'ABU-0193',
    store: 'Gadget Hub Ikeja',
    merchantId: 'gadget-hub-ikeja',
    summary: 'Possible counterfeit phones',
    meta: '4 shopper reports · 2 days',
    severity: 'High',
    status: 'open',
    badge: 'Suspended pending review',
    subtitle: 'gadgethub.ojara.store · Samuel Ojo · Starter · joined Jun 2026',
    reportCount: 4,
    reports: [
      {
        quote: '“Phone came with a fake Apple logo and no IMEI on the box.”',
        source: 'Shopper · order #GH-0412 · 13 Nov',
      },
      {
        quote: '“Seller stopped replying after I asked for a refund.”',
        source: 'Shopper · order #GH-0398 · 12 Nov',
      },
      {
        quote: '“₦180k for a brand new iPhone 15 Pro Max? Too good to be true.”',
        source: 'Shopper · no order · 12 Nov',
      },
    ],
    listings: [
      {
        name: 'iPhone 15 Pro Max 256GB · “brand new original”',
        warning: '62% below typical price',
        priceKobo: 180_000 * N,
      },
      {
        name: 'Samsung S24 Ultra · “UK used, sealed”',
        warning: 'No serial numbers in photos',
        priceKobo: 210_000 * N,
      },
    ],
    options: DEFAULT_OPTIONS,
  },
  {
    id: 'ABU-0194',
    store: 'Quick Cash Deals',
    summary: 'Prohibited: lending services',
    meta: 'Auto-flagged · 5 h',
    severity: 'High',
    status: 'open',
    badge: 'Blocked before publishing',
    subtitle: 'quickcash.ojara.store · Emeka Obi · Free · joined Nov 2026',
    reportCount: 1,
    reports: [
      {
        quote: '“Get ₦50,000 in 10 minutes. No BVN needed.” — matched “Loans & lending”.',
        source: 'Automatic check · store description · 15 Nov',
      },
    ],
    listings: [
      {
        name: 'Instant loan application fee',
        warning: 'Prohibited category: loans & lending',
        priceKobo: 2_500 * N,
      },
    ],
    options: [
      { title: 'Keep blocked & notify seller', body: 'Store cannot publish while it offers loans' },
      { title: 'Remove flagged listings only', body: 'Seller can publish without the listing' },
      { title: 'Restore store', body: 'Close the case with no action' },
    ],
  },
  {
    id: 'ABU-0189',
    store: 'Royal Hair Empire',
    summary: 'Paid orders not delivered',
    meta: '2 complaints · 1 day',
    severity: 'Medium',
    status: 'open',
    badge: 'Waiting for merchant',
    subtitle: 'royalhair.ojara.store · Chidinma Eke · Starter · joined Feb 2026',
    reportCount: 2,
    reports: [
      {
        quote: '“Paid on 2 Nov, still no wig and no reply on WhatsApp.”',
        source: 'Shopper · order #RH-1180 · 14 Nov',
      },
      {
        quote: '“Tracking link never worked.”',
        source: 'Shopper · order #RH-1164 · 13 Nov',
      },
    ],
    listings: [],
    options: [
      { title: 'Ask merchant to respond in 48 h', body: 'Store stays live while we wait' },
      { title: 'Pause checkout', body: 'Store stays visible but cannot take orders' },
      { title: 'Close the case', body: 'Orders were delivered; no action' },
    ],
  },
];

export const ABUSE_RESOLVED_COUNT = 41;

/* ─────────────────────────── 06.07 Support tickets ──────────────────────── */

export interface SupportTicket {
  id: string;
  store: string;
  merchantId: string;
  plan: PlanKey;
  subject: string;
  meta: string;
  metaUrgent?: boolean;
  topic: string;
  opened: string;
  assignee: string;
  messages: {
    from: string;
    role: 'merchant' | 'staff';
    time: string;
    body: string;
    attachment?: string;
  }[];
  draft: string;
  macros: string[];
  channelNote: string;
  context: { label: string; value: string }[];
}

export const SUPPORT_TABS = [
  { key: 'open', label: 'Open', count: 12 },
  { key: 'mine', label: 'Mine', count: 4 },
  { key: 'solved', label: 'Solved' },
] as const;

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'SUP-2041',
    store: 'Adùnní Threads',
    merchantId: 'adunni-threads',
    plan: 'STARTER',
    subject: 'adunnithreads.com isn’t connecting',
    meta: 'Merchant replied · 12 min',
    topic: 'Domains',
    opened: 'opened today 10:20',
    assignee: 'Tolu O.',
    messages: [
      {
        from: 'Adùnní Ogunleye',
        role: 'merchant',
        time: '10:20',
        body: 'I added the records on Whogohost yesterday but Ojara still says “Waiting for DNS”. Customers are typing adunnithreads.com and getting nothing 😩',
      },
      {
        from: 'Tolu O.',
        role: 'staff',
        time: '10:34',
        body: 'Thanks Adùnní — your A record is perfect. The www CNAME is missing, so www.adunnithreads.com doesn’t work yet. In Whogohost, add: Type CNAME · Host www · Value stores.ojara.app. I’ve sent you the 2-minute guide.',
      },
      {
        from: 'Adùnní Ogunleye',
        role: 'merchant',
        time: '12:08',
        body: 'Done! Screenshot attached.',
        attachment: 'whogohost-dns.png · 182 KB',
      },
    ],
    draft:
      'Both records found ✅ HTTPS is being set up now — usually under 15 minutes. I’ll keep this open until it’s live.',
    macros: ['Insert guide: Connect domain', 'Check DNS now'],
    channelNote: 'Reply by email + in-app · merchant prefers WhatsApp',
    context: [
      { label: 'Plan', value: 'Starter · since 15 Nov' },
      { label: 'Store', value: 'Live · 18 products' },
      { label: 'Domain', value: 'A ✓ · CNAME ✓ · HTTPS pending' },
      { label: 'Sales (30d)', value: '₦1.28M · 86 orders' },
      { label: 'Past tickets', value: '1 solved' },
    ],
  },
  {
    id: 'SUP-2039',
    store: 'Kano Leather Co.',
    merchantId: 'kano-leather-co',
    plan: 'FREE',
    subject: 'Can’t find where to add delivery zones',
    meta: '2 h 14 min waiting',
    metaUrgent: true,
    topic: 'Delivery',
    opened: 'opened today 08:06',
    assignee: 'Unassigned',
    messages: [
      {
        from: 'Abubakar Sani',
        role: 'merchant',
        time: '08:06',
        body: 'I want to charge ₦2,500 for delivery outside Kano but I can’t see where to set it. Please help.',
      },
    ],
    draft: '',
    macros: ['Insert guide: Delivery zones'],
    channelNote: 'Reply by email + in-app',
    context: [
      { label: 'Plan', value: 'Free' },
      { label: 'Store', value: 'Onboarding · 4 products' },
      { label: 'Domain', value: 'kanoleather.ojara.store' },
      { label: 'Sales (30d)', value: '₦0 · 0 orders' },
      { label: 'Past tickets', value: 'None' },
    ],
  },
  {
    id: 'SUP-2037',
    store: 'Bayo’s Sneakers',
    merchantId: 'bayos-sneakers',
    plan: 'STARTER',
    subject: 'My plan payment failed but card is fine',
    meta: '3 h waiting',
    topic: 'Billing',
    opened: 'opened today 07:18',
    assignee: 'Tobi O.',
    messages: [
      {
        from: 'Bayo Lawal',
        role: 'merchant',
        time: '07:18',
        body: 'Ojara says my Starter renewal failed but I just used the same Verve card to buy data. Will my store go back to Free?',
      },
    ],
    draft: '',
    macros: ['Retry charge now', 'Insert guide: Update billing card'],
    channelNote: 'Reply by email + in-app',
    context: [
      { label: 'Plan', value: 'Starter · past due' },
      { label: 'Store', value: 'Live · 92 products' },
      { label: 'Domain', value: 'bayosneakers.ojara.store' },
      { label: 'Sales (30d)', value: '₦3.3M · 141 orders' },
      { label: 'Past tickets', value: '2 solved' },
    ],
  },
  {
    id: 'SUP-2031',
    store: 'Glow by Temi',
    merchantId: 'glow-by-temi',
    plan: 'PROFESSIONAL',
    subject: 'Can staff see my payouts?',
    meta: 'Yesterday',
    topic: 'Staff',
    opened: 'opened yesterday 16:40',
    assignee: 'Tolu O.',
    messages: [
      {
        from: 'Temi Ajayi',
        role: 'merchant',
        time: '16:40',
        body: 'I’m adding two staff accounts for Black Friday. Can they see my payouts and bank details?',
      },
    ],
    draft: '',
    macros: ['Insert guide: Staff permissions'],
    channelNote: 'Reply by email + in-app',
    context: [
      { label: 'Plan', value: 'Professional · since 2 Apr' },
      { label: 'Store', value: 'Live · 412 products' },
      { label: 'Domain', value: 'glowbytemi.com · HTTPS ✓' },
      { label: 'Sales (30d)', value: '₦6.9M · 298 orders' },
      { label: 'Past tickets', value: '5 solved' },
    ],
  },
  {
    id: 'SUP-2028',
    store: 'Mama Nkechi Foods',
    merchantId: 'mama-nkechi-foods',
    plan: 'STARTER',
    subject: 'Customer says she paid twice',
    meta: 'Yesterday',
    topic: 'Payments',
    opened: 'opened yesterday 11:02',
    assignee: 'Tobi O.',
    messages: [
      {
        from: 'Nkechi Udo',
        role: 'merchant',
        time: '11:02',
        body: 'A customer says she was debited twice for order #MN-0233. I only see one payment. What should I tell her?',
      },
    ],
    draft: '',
    macros: ['Insert guide: Double debits'],
    channelNote: 'Reply by email + in-app',
    context: [
      { label: 'Plan', value: 'Starter · since 8 May' },
      { label: 'Store', value: 'Live · 64 products' },
      { label: 'Domain', value: 'mamankechi.ojara.store' },
      { label: 'Sales (30d)', value: '₦2.4M · 120 orders' },
      { label: 'Past tickets', value: '1 solved' },
    ],
  },
];

/* ─────────────────────────── 06.08 Announcements ────────────────────────── */

export const ANNOUNCEMENT_DRAFT = {
  title: 'Get ready for Black Friday week',
  message:
    'Black Friday is 28 November. Check your stock, set delivery cut-offs and share your store link early so customers can find you before the rush.',
  audiences: [
    { label: 'All merchants', selected: false },
    { label: 'Free', selected: true },
    { label: 'Starter', selected: true },
    { label: 'Professional', selected: true },
    { label: 'Fashion & beauty only', selected: true },
  ],
  reach: '≈ 1,640 published stores will receive this',
  channels: [
    { label: 'Dashboard banner', checked: true },
    { label: 'Email', checked: true },
    { label: 'SMS', checked: false },
  ],
  smsNote: 'SMS costs about ₦4 per merchant — use it for urgent notices only.',
  sendAt: 'Send Mon 17 Nov, 9:00am WAT',
  preview: {
    title: 'Get ready for Black Friday week',
    body: 'Check your stock, set delivery cut-offs and share your link early.',
    cta: 'Read the checklist',
  },
};

export const RECENT_ANNOUNCEMENTS = [
  {
    title: 'USSD payments are back to normal',
    meta: 'Sent 12 Nov · all merchants · 68% opened',
    status: 'Sent',
  },
  {
    title: 'New: WhatsApp share button',
    meta: 'Sent 3 Nov · all merchants · 74% opened',
    status: 'Sent',
  },
  { title: 'Starter price update', meta: 'Draft · Starter only · —', status: 'Draft' },
] as const;

/* ────────────────────────────── 06.09 Audit log ─────────────────────────── */

export type AuditIcon = 'view' | 'plan' | 'suspend' | 'announce' | 'refund' | 'signin';

export const AUDIT_LOG: {
  when: string;
  admin: string;
  icon: AuditIcon;
  action: string;
  store: string | null;
  ip: string;
}[] = [
  {
    when: 'Today 14:02',
    admin: 'Kemi Adebayo',
    icon: 'view',
    action: 'Opened abuse case #ABU-0193 and viewed flagged listings',
    store: 'Gadget Hub Ikeja',
    ip: '102.89.4.17',
  },
  {
    when: 'Today 12:31',
    admin: 'Tolu Ogun',
    icon: 'view',
    action: 'Viewed merchant dashboard (read-only) for ticket #SUP-2041',
    store: 'Adùnní Threads',
    ip: '102.89.4.22',
  },
  {
    when: 'Today 09:10',
    admin: 'Kemi Adebayo',
    icon: 'plan',
    action: 'Changed Starter staff limit 1 → 2 (unpublished)',
    store: null,
    ip: '102.89.4.17',
  },
  {
    when: 'Yesterday 16:44',
    admin: 'Kemi Adebayo',
    icon: 'suspend',
    action: 'Suspended store pending review · reason: counterfeit reports',
    store: 'Gadget Hub Ikeja',
    ip: '102.89.4.17',
  },
  {
    when: 'Yesterday 11:05',
    admin: 'Tobi Okafor',
    icon: 'announce',
    action: 'Scheduled announcement “Get ready for Black Friday week”',
    store: '1,640 stores',
    ip: '197.210.8.3',
  },
  {
    when: '13 Nov 15:20',
    admin: 'Tolu Ogun',
    icon: 'refund',
    action: 'Issued plan refund ₦5,000 · double charge',
    store: 'Kiddies Corner Ibadan',
    ip: '102.89.4.22',
  },
  {
    when: '13 Nov 08:59',
    admin: 'Tobi Okafor',
    icon: 'signin',
    action: 'Signed in with security key',
    store: null,
    ip: '197.210.8.3',
  },
];

/* ──────────────────────────── 06.10 Admin settings ──────────────────────── */

export const ADMIN_ROLES = ['Owner', 'Support agent', 'Billing', 'Reviewer'] as const;

export const ADMIN_TEAM: {
  name: string;
  email: string;
  team: string;
  twoFactor: string | null;
  role: (typeof ADMIN_ROLES)[number];
}[] = [
  {
    name: 'Kemi Adebayo',
    email: 'kemi@ojara.store',
    team: 'Operations',
    twoFactor: 'Security key',
    role: 'Owner',
  },
  {
    name: 'Tolu Ogun',
    email: 'tolu@ojara.store',
    team: 'Support',
    twoFactor: 'Authenticator app',
    role: 'Support agent',
  },
  {
    name: 'Tobi Okafor',
    email: 'tobi@ojara.store',
    team: 'Finance',
    twoFactor: 'Security key',
    role: 'Billing',
  },
  {
    name: 'Ada Nwosu',
    email: 'ada@ojara.store',
    team: 'Trust & safety',
    twoFactor: null,
    role: 'Reviewer',
  },
];

export const SECURITY_RULES = [
  {
    title: 'Require two-step sign-in for all admins',
    body: 'Ada can’t open merchant data until she sets it up',
    on: true,
  },
  {
    title: 'Second approver for terminations & refunds over ₦50,000',
    body: 'Protects merchants from one-person mistakes',
    on: true,
  },
  {
    title: 'Notify merchants when staff view their account',
    body: 'Sends an email with the reason and time',
    on: true,
  },
];

export const PAYMENT_PROVIDER = {
  name: 'Paystack · Live mode',
  key: 'sk_live_••••••••••••7Qx2',
  status: 'Healthy',
  note: 'More providers (Flutterwave, Monnify) can be added later without changing stores.',
};

export const PROHIBITED_CATEGORIES = [
  'Loans & lending',
  'Weapons',
  'Prescription drugs',
  'Counterfeit goods',
  'Adult content',
  'Crypto investments',
];
