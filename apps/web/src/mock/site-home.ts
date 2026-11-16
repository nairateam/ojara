/**
 * Sample content for the premium Home page (08). Copy is taken from the design; figures,
 * sellers and testimonials are placeholders until real data is wired up. Money is integer kobo.
 */
import { PLANS, type PlanKey } from '@ojara/shared';
import {
  CreditCard,
  ImageIcon,
  Landmark,
  Link as LinkIcon,
  type LucideIcon,
  MapPin,
  MessageCircle,
  NotebookPen,
  Package,
  Smartphone,
} from 'lucide-react';
import type { StoreCategory } from './marketing';

/* ----------------------------------------------------------------- Hero */

/** Rotating-looking benefit list on the right of the hero (first one is "active"). */
export const HERO_BENEFITS = [
  'Instant Paystack payouts',
  'No more “is it available?”',
  'Every order in one list',
  'Your own .com',
];

export const HERO_PAYOUT = {
  label: 'Next payout',
  when: 'Mon · GTBank',
  /** Relative bar heights (px) of the little payout chart; the last bar is highlighted. */
  bars: [10, 16, 12, 22, 18, 28, 24, 34],
};

/* -------------------------------------------------------------- Marquee */

export type MarqueeSeller = { name: string; meta: string; photo: string };

/** Two rows of seller chips under the hero. `null` marks the "Your store here" chip. */
export const MARQUEE_ROWS: (MarqueeSeller | null)[][] = [
  [
    { name: 'Adùnní Threads', meta: 'Fashion · Ibadan', photo: '/mock/generated-6.jpg' },
    { name: 'Mama Nkechi', meta: 'Fashion · Enugu', photo: '/mock/generated-9.jpg' },
    { name: 'glow by temi', meta: 'Beauty · Lagos', photo: '/mock/generated-17.jpg' },
    { name: 'Lush Home NG', meta: 'Home & décor · Abuja', photo: '/mock/generated-18.jpg' },
    { name: 'Ikeja Plug', meta: 'Gadgets · Lagos', photo: '/mock/generated-15.jpg' },
    { name: 'Kaftan House', meta: 'Fashion · Lagos', photo: '/mock/generated-3.jpg' },
    { name: 'Gele by Bimpe', meta: 'Fabrics · Abeokuta', photo: '/mock/generated-2.jpg' },
    { name: 'Tote & Thread', meta: 'Accessories · Jos', photo: '/mock/generated-8.jpg' },
  ],
  [
    { name: 'Zaria Spice House', meta: 'Food · Kano', photo: '/mock/generated-16.jpg' },
    { name: 'Ankara & Co', meta: 'Accessories · Port Harcourt', photo: '/mock/generated-1.jpg' },
    { name: 'Ọ̀ṣun Bags', meta: 'Accessories · Ibadan', photo: '/mock/generated-7.jpg' },
    null,
    { name: 'Adire Lab', meta: 'Fabrics · Osogbo', photo: '/mock/generated-5.jpg' },
    { name: 'Ìyá Rèté Fabrics', meta: 'Fabrics · Lagos', photo: '/mock/generated-10.jpg' },
    { name: 'Bloom Kaftans', meta: 'Fashion · Abuja', photo: '/mock/generated-12.jpg' },
  ],
];

/** Overlapping faces in the "Trusted by" line. */
export const PROOF_AVATARS = [
  '/mock/generated-6.jpg',
  '/mock/generated-17.jpg',
  '/mock/generated-15.jpg',
  '/mock/generated-16.jpg',
  '/mock/generated-18.jpg',
];

/* ------------------------------------------------------- Features bento */

export const BENTO_ORDERS = [
  { initials: 'CO', name: 'Chiamaka Obi', status: 'Paid · Packing', amountKobo: 3_650_000 },
  { initials: 'TB', name: 'Tunde Bakare', status: 'Paid · Ready', amountKobo: 2_700_000 },
  { initials: 'AB', name: 'Aisha Bello', status: 'Pending · —', amountKobo: 5_200_000 },
  { initials: 'EO', name: 'Efe Okoro', status: 'Paid · Shipped', amountKobo: 2_400_000 },
];

export const BENTO_PAYOUT = {
  label: 'Paid out Monday · GTBank ••6789',
  amountKobo: 11_830_000,
  note: '14 payments · fees shown upfront',
};

export type StockLevel = 'low' | 'out' | 'ok';

export const BENTO_STOCK: { name: string; left: number; percent: number; level: StockLevel }[] = [
  { name: 'Adire Wrap Dress · M', left: 2, percent: 12.5, level: 'low' },
  { name: 'Kampala Shirt · L', left: 0, percent: 0.5, level: 'out' },
  { name: 'Aso-oke Gele', left: 8, percent: 50, level: 'ok' },
];

export const BENTO_CHANNELS = ['WhatsApp', 'Instagram', 'TikTok'];

/* ------------------------------------------------------------- Payments */

export const PAYMENT_POINTS = [
  { title: 'Card, bank transfer or USSD', body: 'Customers pay the way they already do.' },
  {
    title: 'No chasing proof of payment',
    body: 'Ojara marks the order paid the moment Paystack confirms.',
  },
  { title: 'No cut of your sales', body: 'Paystack’s fee is the only charge on each payment.' },
];

export const PAYMENT_TOAST = {
  title: 'Payment successful',
  body: '₦27,000 from Tunde B. is on its way to your bank.',
};

/* ----------------------------------------------------- Flow comparison */

export const OLD_WAY: { time: string; text: string; icon: LucideIcon }[] = [
  { time: '9:02 am', text: '“Is this still available?”', icon: MessageCircle },
  { time: '9:40 am', text: 'Check the notebook for stock', icon: NotebookPen },
  { time: '10:15 am', text: 'Send your account number', icon: Landmark },
  { time: '11:30 am', text: 'Wait for a transfer screenshot', icon: ImageIcon },
  { time: '11:52 am', text: 'Confirm it in your bank app', icon: Smartphone },
  { time: '12:20 pm', text: 'Type out their address again', icon: MapPin },
];

export const OJARA_WAY: { time: string; title: string; body: string; icon: LucideIcon }[] = [
  {
    time: '9:02 am',
    title: 'Share your store link',
    body: 'Once — in your bio, status or a DM.',
    icon: LinkIcon,
  },
  {
    time: '9:04 am',
    title: 'Customer picks and pays',
    body: 'Card, transfer or USSD. Paystack confirms it for you.',
    icon: CreditCard,
  },
  {
    time: '9:05 am',
    title: 'You pack and send',
    body: 'Address, phone and order are already in your inbox.',
    icon: Package,
  },
];

export const FLOW_TOTALS = {
  old: { value: '3h 18m', note: 'You, the whole time' },
  ojara: { value: '3 min', note: '66× faster' },
};

/* -------------------------------------------------------------- Process */

export const PROCESS_STEPS = [
  {
    tag: '2 min',
    title: 'Tell us about your business',
    body: 'Name, what you sell and where. Two minutes, from your phone.',
  },
  {
    tag: '6 min',
    title: 'Add products and get paid',
    body: 'Snap photos, set prices and stock, connect Paystack to your bank.',
  },
  {
    tag: 'Live',
    title: 'Share your link',
    body: 'Instagram bio, WhatsApp status, everywhere. Orders arrive paid.',
  },
];

/* ----------------------------------------------------------- Categories */

/** `filter` is the /stores category filter the card opens. */
export const HOME_CATEGORIES: {
  title: string;
  body: string;
  photo: string;
  filter?: StoreCategory;
}[] = [
  {
    title: 'Fashion',
    body: 'Sizes, colours and stock per variant.',
    photo: '/mock/generated-4.jpg',
    filter: 'Fashion',
  },
  {
    title: 'Beauty',
    body: 'Batch-made products, repeat customers.',
    photo: '/mock/generated-17.jpg',
    filter: 'Beauty',
  },
  {
    title: 'Food & groceries',
    body: 'Same-day delivery zones and pickup.',
    photo: '/mock/generated-16.jpg',
    filter: 'Food & groceries',
  },
  {
    title: 'Gadgets',
    body: 'Warranty notes and high-value payments.',
    photo: '/mock/generated-15.jpg',
    filter: 'Gadgets',
  },
  {
    title: 'Home & décor',
    body: 'Big photos that sell the room.',
    photo: '/mock/generated-18.jpg',
    filter: 'Home & décor',
  },
  {
    title: 'Fabrics & crafts',
    body: 'One-of-a-kind pieces, made to order.',
    photo: '/mock/generated-5.jpg',
    filter: 'Fabrics & crafts',
  },
];

/* --------------------------------------------------------- Testimonials */

export const HOME_RATING = { stars: 5, label: '4.9 from 1,200+ merchant reviews' };

export const FEATURED_TESTIMONIAL = {
  quote:
    '“I used to spend my evenings answering ‘how much?’ in DMs. Now I send one link, people pay, and I wake up to orders already confirmed.”',
  initials: 'AA',
  name: 'Adùnní Adebayo',
  store: 'Adùnní Threads · Ibadan',
  metric: '3.2×',
  metricLabel: 'more orders in 90 days',
};

export const SIDE_TESTIMONIALS = [
  {
    tag: 'Payouts',
    quote: '“Paystack payouts land the next morning. I stopped chasing transfers for good.”',
    initials: 'CO',
    name: 'Chinedu Okafor',
    store: 'Gadget Corner · Lagos',
  },
  {
    tag: 'Orders',
    quote: '“My customers in Abuja order at 2am. The store just keeps selling while I sleep.”',
    initials: 'FB',
    name: 'Fatima Bello',
    store: 'Zaria Spice House · Kano',
  },
];

/* -------------------------------------------------------------- Pricing */

/** Yearly billing charges ten months ("2 months free"). */
export const YEARLY_MONTHS_CHARGED = 10;

export const HOME_PLAN_BLURBS: Record<PlanKey, string> = {
  FREE: 'For trying it out with your first customers.',
  STARTER: 'For stalls selling every week.',
  PROFESSIONAL: 'For growing brands with a team.',
};

const count = (n: number) => n.toLocaleString('en-NG');

/** Short feature lists for the home plan cards; limits come from `PLANS`. */
export const HOME_PLAN_FEATURES: Record<PlanKey, string[]> = {
  FREE: [
    `Up to ${count(PLANS.FREE.limits.maxProducts)} products`,
    'Ojara subdomain store',
    'Paystack checkout',
    'Delivery zones & pickup',
  ],
  STARTER: [
    `Up to ${count(PLANS.STARTER.limits.maxProducts)} products`,
    'Bring your own .com',
    'Discounts & sale prices',
    'No Ojara branding',
    'Next-day payouts',
  ],
  PROFESSIONAL: [
    'Everything in Starter',
    `Up to ${count(PLANS.PROFESSIONAL.limits.maxProducts)} products`,
    `${PLANS.PROFESSIONAL.limits.staffAccounts} staff accounts`,
    `Up to ${PLANS.PROFESSIONAL.limits.maxImagesPerProduct} photos per product`,
    'Priority support',
  ],
};

/* ------------------------------------------------------------------ FAQ */

export const HOME_FAQ: { q: string; a: string; open?: boolean }[] = [
  {
    q: 'Do I need a website or a developer?',
    a: 'No. Add products from your phone and share your link. Most stores go live in under ten minutes.',
    open: true,
  },
  {
    q: 'How do I get paid?',
    a: 'Customers pay by card, transfer or USSD through Paystack. Money settles to your Nigerian bank account the next business day.',
    open: true,
  },
  {
    q: 'Does Ojara take a percentage of my sales?',
    a: 'No. You pay a flat monthly plan price, and ₦0 on Free. Paystack’s standard fee on each payment is the only per-sale charge.',
  },
  {
    q: 'Can I use my own domain name?',
    a: 'Yes, on Starter and Professional. Every store also gets a free yourname.ojara.store address.',
  },
  {
    q: 'What happens to orders while I’m asleep?',
    a: 'Your store keeps selling. Customers pay through Paystack and each paid order is waiting in your order list in the morning, with their address and phone number.',
  },
  {
    q: 'Can I move my Instagram catalogue over?',
    a: 'Add your products with the photos you already have on your phone. Start with a few best-sellers and add the rest as you go.',
  },
];

export const FAQ_SUPPORT_HOURS = 'Still unsure? Our team answers on WhatsApp, 8am–8pm, every day.';
