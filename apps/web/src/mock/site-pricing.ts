/**
 * Sample content for the premium Pricing page (09). Prices and limits come from `PLANS`; copy is
 * from the design, adjusted where the design promised something Ojara doesn't do yet (no trial,
 * products capped per PLANS, payouts on Paystack's schedule for every plan).
 */
import { PLANS, type PlanKey } from '@ojara/shared';

const count = (n: number) => n.toLocaleString('en-NG');

/** Yearly billing charges ten months ("2 months free"). */
export const YEARLY_MONTHS_CHARGED = 10;

export const PRICING_PLAN_CARDS: Record<
  PlanKey,
  { description: string; cta: string; features: string[] }
> = {
  FREE: {
    description: 'For trying it out with your first customers.',
    cta: 'Start free',
    features: [
      `Up to ${count(PLANS.FREE.limits.maxProducts)} products`,
      'Ojara subdomain store',
      'Paystack checkout',
      'Delivery zones & pickup',
    ],
  },
  STARTER: {
    description: 'For stalls selling every week.',
    cta: 'Start with Starter',
    features: [
      `Up to ${count(PLANS.STARTER.limits.maxProducts)} products`,
      'Bring your own .com',
      'Sale prices on products',
      'No Ojara branding',
      `${PLANS.STARTER.limits.maxImagesPerProduct} photos per product`,
    ],
  },
  PROFESSIONAL: {
    description: 'For growing brands with a team.',
    cta: 'Choose Professional',
    features: [
      'Everything in Starter',
      `${PLANS.PROFESSIONAL.limits.staffAccounts} staff accounts`,
      `Up to ${count(PLANS.PROFESSIONAL.limits.maxProducts)} products`,
      `${PLANS.PROFESSIONAL.limits.maxImagesPerProduct} photos per product`,
      'Priority support',
    ],
  },
};

/** `true` = check, `false` = dash, string = value. One entry per plan, in PLAN_KEYS order. */
export type CompareCell = boolean | string;
export type CompareRow = { label: string; cells: [CompareCell, CompareCell, CompareCell] };

const byPlan = <T>(pick: (key: PlanKey) => T): [T, T, T] => [
  pick('FREE'),
  pick('STARTER'),
  pick('PROFESSIONAL'),
];

export const PRICING_COMPARE: { group: string; rows: CompareRow[] }[] = [
  {
    group: 'Selling',
    rows: [
      { label: 'Products', cells: byPlan((k) => count(PLANS[k].limits.maxProducts)) },
      {
        label: 'Photos per product',
        cells: byPlan((k) => String(PLANS[k].limits.maxImagesPerProduct)),
      },
      { label: 'Your own domain (.com, .ng)', cells: byPlan((k) => PLANS[k].limits.customDomain) },
      { label: 'Remove Ojara branding', cells: byPlan((k) => PLANS[k].limits.removeBranding) },
    ],
  },
  {
    group: 'Payments',
    rows: [
      { label: 'Paystack checkout — card, transfer, USSD', cells: [true, true, true] },
      {
        label: 'Payouts to your bank',
        cells: ['Next business day', 'Next business day', 'Next business day'],
      },
      { label: 'Sale prices', cells: byPlan((k) => PLANS[k].limits.promotions) },
      { label: 'Delivery zones & fees', cells: [true, true, true] },
    ],
  },
  {
    group: 'Orders & stock',
    rows: [
      { label: 'Order inbox', cells: [true, true, true] },
      { label: 'Low-stock alerts', cells: [true, true, true] },
      { label: 'Staff accounts', cells: byPlan((k) => String(PLANS[k].limits.staffAccounts)) },
    ],
  },
  {
    group: 'Support',
    rows: [
      { label: 'WhatsApp support, 8am–8pm', cells: [true, true, true] },
      { label: 'Priority support', cells: [false, false, true] },
    ],
  },
];

/** "Keep what you earn" calculator defaults (design: ₦1,500,000 a month). */
export const SAVINGS_CALCULATOR = {
  defaultSalesKobo: 150_000_000,
  marketplacePercent: 10,
  socialAppPercent: 5,
};

export const BILLING_FAQ: { q: string; a: string }[] = [
  {
    q: 'Do I need a card to start?',
    a: 'No. The Free plan needs no card and stays free for as long as you like. You only pay when you choose Starter or Professional.',
  },
  {
    q: 'How do I pay for my plan?',
    a: 'By card, bank transfer or USSD through Paystack — the same way your customers pay you. Yearly plans get two months free.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes, any time. Upgrades apply straight away; downgrades at the end of your billing month. If you move down to Free, products above the limit are hidden, not deleted.',
  },
  {
    q: `What happens if I go over ${count(PLANS.FREE.limits.maxProducts)} products on Free?`,
    a: 'Everything you’ve already listed stays live. To add more, upgrade to Starter or archive a product you no longer sell.',
  },
  {
    q: 'Do you take a cut of my sales?',
    a: 'No. Ojara only charges the plan price. Paystack charges its own payment fee on each sale, which comes out of your payout.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Move back to Free from your billing settings whenever you like. Your paid plan keeps running until the end of the period you’ve paid for.',
  },
];
