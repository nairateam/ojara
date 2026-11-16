import { SITE_STATS } from './site';

/**
 * Sample copy for the premium About page (11). Team, figures and story are placeholders from the
 * design until real ones are supplied.
 */

export const ABOUT_HERO = {
  eyebrow: 'About Ojara',
  line1: 'Built in Lagos,',
  line2: 'for every market stall.',
};

export const ABOUT_STORY = {
  since: 'Since 2024',
  statement:
    'Nigerian businesses were already selling online — through DMs, voice notes and screenshots of bank transfers. The hustle was real. The shop just hadn’t caught up.',
  paragraphs: [
    'Ojara started at a fabric stall in Balogun, watching a seller juggle three WhatsApp chats, a notebook of who’d paid, and a phone calculator — while customers kept asking if the blue adire was still available.',
    'So we built the smallest thing that would help: a store link she could share, a checkout that confirmed payment on its own, and a list that kept every order in one place. Today, more than 1,500 sellers use it to run their business.',
  ],
};

export const ABOUT_STATS: { value: string; label: string }[] = [
  { value: SITE_STATS.storesLive.toLocaleString('en-NG'), label: 'Nigerian stores live' },
  { value: '₦184M', label: 'sold through Ojara last month' },
  { value: '8 min', label: 'average time to publish' },
  { value: '94%', label: 'payments succeed first time' },
];

export const ABOUT_PRINCIPLES: { title: string; body: string }[] = [
  {
    title: 'No cut of your sales.',
    body: 'A flat fee means a big month is your big month. We make money when Ojara is useful, not when you’re busy.',
  },
  {
    title: 'Phone first, always.',
    body: 'Most of our sellers run their whole business from one Android phone. If it doesn’t work there, it doesn’t ship.',
  },
  {
    title: 'Speak like a person.',
    body: 'No jargon, no small print. Our support team is on WhatsApp and answers like a neighbour would.',
  },
  {
    title: 'Money moves fast.',
    body: 'Payments confirm themselves and payouts land the next business day. Cash flow is everything for a small shop.',
  },
];

export const ABOUT_TEAM_INTRO = {
  line1: 'Eighteen people,',
  line2: 'one group chat.',
  body: 'Engineers, designers and seller-success folks across Lagos, Abuja and Port Harcourt — plus a few of us remote.',
};

export const ABOUT_TEAM: { name: string; initials: string; role: string; location: string }[] = [
  { name: 'Tolu Adeyemi', initials: 'TA', role: 'Co-founder & CEO', location: 'Lagos' },
  { name: 'Ifeoma Nwosu', initials: 'IN', role: 'Co-founder & CTO', location: 'Lagos' },
  { name: 'Bayo Olatunji', initials: 'BO', role: 'Head of Seller Success', location: 'Abuja' },
  { name: 'Halima Bello', initials: 'HB', role: 'Design Lead', location: 'Remote' },
];
