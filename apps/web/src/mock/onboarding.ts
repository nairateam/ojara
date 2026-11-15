/**
 * Sample data for the auth screens (02.01–02.03) and the six onboarding steps (02.04–02.09).
 * Money is integer kobo; format with `formatKobo` from @ojara/shared.
 */

export const ONBOARDING_SELLER = {
  name: 'Adùnní Ogunleye',
  email: 'adunni@adunnithreads.com',
  phone: '803 555 0144',
  phoneMasked: '+234 803 ••• 0144',
} as const;

export const ONBOARDING_STORE = {
  name: 'Adùnní Threads',
  initial: 'A',
  slug: 'adunni',
  host: 'adunni.ojara.store',
  instagram: 'adunnithreads',
  whatsapp: '+234 803 555 0144',
  state: 'Lagos',
  logoFile: { name: 'adunni-logo.png', meta: '512 × 512 · 84 KB · Square images look best' },
  heroImage: '/mock/generated-4.jpg',
  heroHeadline: 'Hand-dyed adire, made in Abeokuta',
} as const;

/** Auth brand-panel collage (dress, gele, hat, kaftan; heights alternate 200/170). */
export const AUTH_COLLAGE = [
  { src: '/mock/generated.jpg', alt: 'Adire wrap dress on a hanger', height: 200 },
  { src: '/mock/generated-2.jpg', alt: 'Folded aso-oke gele', height: 170 },
  { src: '/mock/generated-1.jpg', alt: 'Ankara bucket hat', height: 200 },
  { src: '/mock/generated-3.jpg', alt: 'Indigo kaftan with embroidery', height: 170 },
] as const;

export const AUTH_TESTIMONIAL = {
  quote:
    'I used to take orders in my DMs and lose half of them. Now customers pay before I even wake up.',
  name: 'Adùnní Ogunleye',
  business: 'Adùnní Threads, Lagos',
  initial: 'A',
} as const;

/** "What do you sell?" chips (02.04). Icon names are lucide icons. */
export const BUSINESS_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & clothing', icon: 'shirt' },
  { id: 'beauty', label: 'Beauty & skincare', icon: 'sparkles' },
  { id: 'food', label: 'Food & groceries', icon: 'utensils' },
  { id: 'electronics', label: 'Electronics & gadgets', icon: 'smartphone' },
  { id: 'home', label: 'Home & lifestyle', icon: 'sofa' },
  { id: 'general', label: 'General retail', icon: 'shopping-basket' },
] as const;

export type BusinessCategoryIcon = (typeof BUSINESS_CATEGORIES)[number]['icon'];

export const NIGERIAN_STATES = [
  'Abuja (FCT)',
  'Abia',
  'Anambra',
  'Delta',
  'Edo',
  'Enugu',
  'Kaduna',
  'Kano',
  'Lagos',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Rivers',
] as const;

/** Brand colour swatches (02.05). */
export const BRAND_SWATCHES = [
  { name: 'Indigo', hex: '#2A3A7C' },
  { name: 'Terracotta', hex: '#B5532E' },
  { name: 'Forest', hex: '#2F5D46' },
  { name: 'Plum', hex: '#6B2E5C' },
  { name: 'Charcoal', hex: '#2B2B2B' },
] as const;

export interface OnboardingProduct {
  name: string;
  image: string;
  priceKobo: number;
  stock: number;
  variants?: string;
}

/** Products already saved in step 3, then the one being added. */
export const ONBOARDING_PRODUCTS: OnboardingProduct[] = [
  {
    name: 'Adire Wrap Dress',
    image: '/mock/generated.jpg',
    priceKobo: 1_850_000,
    stock: 23,
    variants: '8 sizes & colours',
  },
  { name: 'Ankara Bucket Hat', image: '/mock/generated-1.jpg', priceKobo: 700_000, stock: 12 },
];

export const DRAFT_PRODUCT = {
  label: 'Product 3',
  name: 'Aso-oke Gele',
  image: '/mock/generated-2.jpg',
  price: '14,000',
  priceKobo: 1_400_000,
  stock: 8,
  category: 'Headwear',
} as const;

export const PRODUCT_CATEGORIES = ['Dresses', 'Headwear', 'Men', 'Fabrics & bags'] as const;

export const NIGERIAN_BANKS = [
  'Access Bank',
  'First Bank',
  'GTBank',
  'Kuda',
  'Moniepoint',
  'Opay',
  'UBA',
  'Zenith Bank',
] as const;

export const PAYOUT = {
  bank: 'GTBank',
  bankInitial: 'G',
  accountNumber: '0123 456 789',
  accountLast4: '6789',
  accountName: 'ADÙNNÍ OGUNLEYE',
  bvnLast4: '4417',
} as const;

/** "How a ₦27,000 order is paid out" (02.07). Paystack local fee: 1.5% + ₦100, capped at ₦2,000. */
export const PAYOUT_EXAMPLE = {
  orderKobo: 2_700_000,
  feeKobo: 50_500,
  receiveKobo: 2_649_500,
} as const;

export interface DeliveryZone {
  zone: string;
  covers: string;
  chargeKobo: number;
  arrives: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    zone: 'Lagos Mainland',
    covers: 'Yaba, Surulere, Ikeja, Maryland',
    chargeKobo: 200_000,
    arrives: '1–2 days',
  },
  {
    zone: 'Lekki & VI',
    covers: 'Lekki, Ajah, Victoria Island, Ikoyi',
    chargeKobo: 250_000,
    arrives: '1–2 days',
  },
  {
    zone: 'Lagos outskirts',
    covers: 'Ikorodu, Epe, Badagry',
    chargeKobo: 350_000,
    arrives: '2–3 days',
  },
  {
    zone: 'Other states',
    covers: 'Nationwide by courier',
    chargeKobo: 500_000,
    arrives: '3–5 days',
  },
];

export const PICKUP = {
  address: '12 Adeniran Ogunsanya St, Surulere, Lagos',
  hours: 'Mon–Sat, 10am – 6pm',
  label: 'Pickup · Surulere studio',
  hoursShort: 'Mon–Sat, 10am–6pm',
  freeDeliveryOver: '40,000',
} as const;

/** The checkout total shown in the 02.08 preview (₦24,500 cart + ₦2,500 Lekki delivery). */
export const CHECKOUT_TOTAL_KOBO = 2_700_000;

/** Step 6 summary rows; `href` is the step to edit. */
export const PUBLISH_CHECKLIST = [
  {
    title: 'Business details',
    summary: 'Fashion & clothing · Lagos · Nigerian naira (₦)',
    href: '/onboarding',
  },
  {
    title: 'Store address & brand',
    summary: 'adunni.ojara.store · Indigo · logo added',
    href: '/onboarding/store',
  },
  {
    title: 'Products',
    summary: '3 products published · 43 items in stock',
    href: '/onboarding/products',
  },
  {
    title: 'Payments',
    summary: 'Paystack · payouts to GTBank ••6789',
    href: '/onboarding/payments',
  },
  {
    title: 'Delivery & pickup',
    summary: '4 delivery zones · free pickup in Surulere',
    href: '/onboarding/delivery',
  },
] as const;
