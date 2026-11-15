/**
 * Sample storefront content for the demo store (Adùnní Threads), taken from the 05 Storefront
 * designs. Store identity (name, colours) comes from the tenant; everything else here stands in
 * for the catalogue / orders API until those features exist. Money is integer kobo.
 */

export type CategorySlug = 'dresses' | 'headwear' | 'men' | 'fabrics-bags';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short nav label (header uses "Fabrics", everywhere else "Fabrics & bags"). */
  navLabel: string;
  description: string;
  image: string;
  /** Plural noun for counts, e.g. "5 dresses". */
  noun: string;
}

export type ProductTagTone = 'new' | 'sale' | 'sold-out' | 'stock';

export interface Product {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  /** Size summary under product cards ("S · M · L", "One size"). */
  sizesLabel: string;
  image: string;
  isNew?: boolean;
  soldOut?: boolean;
  /** Overlay tag on listing pages (e.g. "Only 2 left in M"). */
  listingNote?: string;
}

export interface ProductDetail {
  short: string;
  gallery: { src: string; alt: string }[];
  imageNote: string;
  colours: { name: string; swatch: string }[];
  sizes: { label: string; soldOut?: boolean }[];
  defaultSize: string;
  lowStock?: string;
  lowStockShort?: string;
  fabricCare: string;
  fit: string;
}

export const STORE = {
  tagline: 'Hand-dyed adire and aso-oke pieces from Lagos & Abeokuta.',
  announcement:
    'Free delivery in Lagos on orders over ₦40,000 · Pickup available at our Surulere studio',
  announcementShort: 'Free Lagos delivery over ₦40,000',
  freeDeliveryThreshold: 4_000_000,
  whatsapp: '+234 803 555 0144',
  whatsappHref: 'https://wa.me/2348035550144',
  instagram: '@adunnithreads',
  instagramHref: 'https://instagram.com/adunnithreads',
  email: 'hello@adunnithreads.com',
  address: '12 Adeniran Ogunsanya St, Surulere',
  hours: 'Mon–Sat, 10am–6pm',
  founder: 'Adùnní Ogunleye',
  hero: {
    eyebrow: 'New in · November drop',
    eyebrowShort: 'New in · November',
    title: 'Hand-dyed adire, made in Abeokuta.',
    body: 'Every piece is dyed by hand with indigo, so no two patterns are the same. Made in small batches, shipped across Nigeria.',
    image: '/mock/generated-6.jpg',
  },
  quote:
    '“My grandmother dyed cloth at Itoku market. I started Adùnní Threads on Instagram in 2021 to keep that craft — and those women — working.”',
  story: {
    title: 'Three generations of indigo.',
    paragraphs: [
      'My grandmother dyed cloth in the pits at Itoku market in Abeokuta. My mother sold it in Balogun. I started Adùnní Threads on Instagram in 2021 so the women who still dye by hand could reach buyers across Nigeria.',
      'Every piece is resist-dyed with natural indigo, so no two are exactly alike.',
    ],
    image: '/mock/generated-6.jpg',
    fabricImage: '/mock/generated-5.jpg',
  },
  closed: {
    image: '/mock/generated-5.jpg',
    body: 'The dye pits are busy with a new batch. The store reopens on Monday 24 November — leave your number and we’ll text you the moment it’s back.',
  },
} as const;

export const CATEGORIES: Category[] = [
  {
    slug: 'dresses',
    name: 'Dresses',
    navLabel: 'Dresses',
    description: 'Wrap, maxi and shift dresses — hand-dyed in small batches.',
    image: '/mock/generated-4.jpg',
    noun: 'dresses',
  },
  {
    slug: 'headwear',
    name: 'Headwear',
    navLabel: 'Headwear',
    description: 'Gele, head wraps and hats in aso-oke and ankara.',
    image: '/mock/generated-2.jpg',
    noun: 'pieces',
  },
  {
    slug: 'men',
    name: 'Men',
    navLabel: 'Men',
    description: 'Kaftans and shirts, dyed and tailored in Lagos.',
    image: '/mock/generated-3.jpg',
    noun: 'pieces',
  },
  {
    slug: 'fabrics-bags',
    name: 'Fabrics & bags',
    navLabel: 'Fabrics',
    description: 'Adire by the yard, aso-oke bundles, totes and clutches.',
    image: '/mock/generated-5.jpg',
    noun: 'pieces',
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: 'adire-wrap-dress',
    name: 'Adire Wrap Dress',
    category: 'dresses',
    price: 1_850_000,
    sizesLabel: 'S · M · L',
    image: '/mock/generated.jpg',
    isNew: true,
    listingNote: 'Only 2 left in M',
  },
  {
    slug: 'ankara-two-piece-set',
    name: 'Ankara Two-piece Set',
    category: 'dresses',
    price: 2_200_000,
    compareAtPrice: 2_600_000,
    sizesLabel: 'S · M · L · XL',
    image: '/mock/generated-9.jpg',
  },
  {
    slug: 'adire-smock-dress',
    name: 'Adire Smock Dress',
    category: 'dresses',
    price: 2_100_000,
    sizesLabel: 'S · M · L',
    image: '/mock/generated-12.jpg',
    isNew: true,
  },
  {
    slug: 'kampala-shift-dress',
    name: 'Kampala Shift Dress',
    category: 'dresses',
    price: 1_600_000,
    sizesLabel: 'S · M · L',
    image: '/mock/generated-11.jpg',
  },
  {
    slug: 'ankara-wrap-midi',
    name: 'Ankara Wrap Midi',
    category: 'dresses',
    price: 1_950_000,
    sizesLabel: 'S · M · L · XL',
    image: '/mock/generated-13.jpg',
  },
  {
    slug: 'aso-oke-gele',
    name: 'Aso-oke Gele',
    category: 'headwear',
    price: 1_400_000,
    sizesLabel: 'One size',
    image: '/mock/generated-2.jpg',
  },
  {
    slug: 'ankara-bucket-hat',
    name: 'Ankara Bucket Hat',
    category: 'headwear',
    price: 700_000,
    sizesLabel: 'One size',
    image: '/mock/generated-1.jpg',
  },
  {
    slug: 'adire-head-wrap',
    name: 'Adire Head Wrap',
    category: 'headwear',
    price: 800_000,
    sizesLabel: 'One size',
    image: '/mock/generated-5.jpg',
  },
  {
    slug: 'aso-oke-fila',
    name: 'Aso-oke Fila',
    category: 'headwear',
    price: 900_000,
    sizesLabel: 'M · L',
    image: '/mock/generated-2.jpg',
  },
  {
    slug: 'ankara-turban',
    name: 'Ankara Turban',
    category: 'headwear',
    price: 650_000,
    sizesLabel: 'One size',
    image: '/mock/generated-1.jpg',
  },
  {
    slug: 'indigo-kaftan',
    name: 'Indigo Kaftan',
    category: 'men',
    price: 1_750_000,
    sizesLabel: 'M · L · XL',
    image: '/mock/generated-3.jpg',
  },
  {
    slug: 'kampala-shirt',
    name: 'Kampala Shirt',
    category: 'men',
    price: 1_500_000,
    sizesLabel: 'M · L · XL',
    image: '/mock/generated-10.jpg',
  },
  {
    slug: 'adire-agbada-set',
    name: 'Adire Agbada Set',
    category: 'men',
    price: 3_800_000,
    sizesLabel: 'L · XL',
    image: '/mock/generated-3.jpg',
  },
  {
    slug: 'adire-tote-bag',
    name: 'Adire Tote Bag',
    category: 'fabrics-bags',
    price: 950_000,
    sizesLabel: 'One size',
    image: '/mock/generated-8.jpg',
    soldOut: true,
  },
  {
    slug: 'aso-oke-clutch',
    name: 'Aso-oke Clutch',
    category: 'fabrics-bags',
    price: 1_200_000,
    sizesLabel: 'One size',
    image: '/mock/generated-7.jpg',
  },
  {
    slug: 'adire-fabric-6-yards',
    name: 'Adire Fabric · 6 yards',
    category: 'fabrics-bags',
    price: 1_500_000,
    sizesLabel: '6 yards',
    image: '/mock/generated-5.jpg',
  },
  {
    slug: 'aso-oke-bundle',
    name: 'Aso-oke Bundle',
    category: 'fabrics-bags',
    price: 2_400_000,
    sizesLabel: '3 pieces',
    image: '/mock/generated-2.jpg',
  },
];

/** 05.01 "New this week" grid, in design order. */
export const NEW_THIS_WEEK = [
  'adire-wrap-dress',
  'ankara-two-piece-set',
  'aso-oke-gele',
  'indigo-kaftan',
  'adire-tote-bag',
  'ankara-bucket-hat',
  'aso-oke-clutch',
  'kampala-shirt',
];

/** 05.03 "You may also like". */
export const RELATED = ['aso-oke-clutch', 'ankara-two-piece-set', 'aso-oke-gele', 'indigo-kaftan'];

const WRAP_DRESS_DETAIL: ProductDetail = {
  short:
    'Cotton wrap dress, hand-dyed with indigo in Abeokuta. Adjustable waist tie, flutter sleeves, side pockets.',
  gallery: [
    { src: '/mock/generated-4.jpg', alt: 'Model wearing the Adire Wrap Dress' },
    { src: '/mock/generated.jpg', alt: 'Adire Wrap Dress on a hanger' },
    { src: '/mock/generated-5.jpg', alt: 'Close-up of the adire fabric' },
    { src: '/mock/generated-6.jpg', alt: 'Adire Wrap Dress worn in a courtyard' },
  ],
  imageNote: 'Hand-dyed · each one is unique',
  colours: [
    { name: 'Indigo', swatch: '#2A3A7C' },
    { name: 'Rust', swatch: '#B5532E' },
  ],
  sizes: [{ label: 'S' }, { label: 'M' }, { label: 'L' }, { label: 'XL', soldOut: true }],
  defaultSize: 'M',
  lowStock: 'Only 2 left in M · XL is sold out in Indigo',
  lowStockShort: 'Only 2 left in M',
  fabricCare:
    '100% cotton, hand-dyed. Hand wash cold, separately, for the first few washes — some indigo may transfer. Dry in shade.',
  fit: 'True to size with an adjustable wrap waist. Model is 5′8″ and wears M. S fits UK 8–10, M fits UK 12–14, L fits UK 16–18, XL fits UK 20.',
};

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProducts(slugs: string[]): Product[] {
  return slugs.map(getProduct).filter((p): p is Product => Boolean(p));
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function productsIn(category: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Detail content for a product page (the wrap dress is fully designed; others are derived). */
export function getProductDetail(product: Product): ProductDetail {
  if (product.slug === 'adire-wrap-dress') return WRAP_DRESS_DETAIL;
  const sizes = product.sizesLabel.includes('·')
    ? product.sizesLabel.split(' · ').map((label) => ({ label }))
    : [{ label: product.sizesLabel }];
  return {
    ...WRAP_DRESS_DETAIL,
    short: `${product.name}, made in small batches by our dyers and weavers in Lagos and Abeokuta.`,
    gallery: [{ src: product.image, alt: product.name }],
    sizes,
    defaultSize: sizes[0]?.label ?? 'One size',
    lowStock: undefined,
    lowStockShort: undefined,
  };
}

export interface CartLine {
  slug: string;
  variant: string;
  variantShort: string;
  qty: number;
}

/** 05.04 / 05.05 sample cart. */
export const CART: CartLine[] = [
  { slug: 'indigo-kaftan', variant: 'Size L · Indigo', variantShort: 'L · Indigo', qty: 1 },
  {
    slug: 'ankara-bucket-hat',
    variant: 'One size · Sunset print',
    variantShort: 'One size · Sunset',
    qty: 1,
  },
];

export function cartLines() {
  return CART.map((line) => {
    const product = getProduct(line.slug);
    if (!product) throw new Error(`Unknown product ${line.slug}`);
    return { ...line, product, total: product.price * line.qty };
  });
}

export const CART_COUNT = CART.reduce((n, l) => n + l.qty, 0);
export const CART_SUBTOTAL = cartLines().reduce((n, l) => n + l.total, 0);

export const DELIVERY = {
  area: 'Lekki & VI',
  areaLong: 'Lekki & Victoria Island',
  fee: 250_000,
  fromFee: 200_000,
  eta: 'Mon 17 – Tue 18 Nov',
};

export const DELIVERY_AREAS = [
  { value: 'lekki', label: 'Lekki & Victoria Island', fee: 250_000 },
  { value: 'ikoyi', label: 'Ikoyi', fee: 250_000 },
  { value: 'surulere', label: 'Surulere & Yaba', fee: 200_000 },
  { value: 'ikeja', label: 'Ikeja & Maryland', fee: 300_000 },
  { value: 'mainland', label: 'Other Lagos mainland', fee: 300_000 },
];

export const STATES = ['Lagos', 'Ogun', 'Oyo', 'FCT Abuja', 'Rivers', 'Other state'];

/** 05.05 – 05.08 sample order and checkout details. */
export const ORDER = {
  number: '#OJ-1047',
  firstName: 'Tunde',
  fullName: 'Tunde Bakare',
  shortName: 'Tunde B.',
  phone: '803 555 0192',
  phoneMasked: '••• ••• 0192',
  email: 'tunde.bakare@gmail.com',
  street: '14 Admiralty Way, Lekki Phase 1',
  town: 'Lekki Phase 1',
  state: 'Lagos',
  riderNote: 'Please call before delivery — gate code is 2210.',
  placedAt: 'today at 09:15',
  total: CART_SUBTOTAL + DELIVERY.fee,
  heldUntil: '10:12',
  failureReason: 'card declined by your bank (insufficient funds)',
  /** Fulfilment status for 05.08 (customer label "Being prepared"). */
  status: 'PROCESSING' as const,
  timeline: [
    { status: 'PENDING', note: 'Today 09:15' },
    { status: 'PROCESSING', note: 'Started 09:40' },
    { status: 'SHIPPED', note: undefined },
    { status: 'DELIVERED', note: 'Est. Mon 17 – Tue 18 Nov' },
  ] as const,
};

export interface Policy {
  slug: string;
  title: string;
  updated: string;
  facts?: { icon: 'calendar' | 'refresh' | 'wallet'; title: string; sub: string }[];
  sections: { heading: string; body: string }[];
}

export const POLICIES: Policy[] = [
  {
    slug: 'returns',
    title: 'Returns & exchanges',
    updated: 'Last updated 15 November 2026',
    facts: [
      { icon: 'calendar', title: '7 days', sub: 'from delivery to ask' },
      { icon: 'refresh', title: 'Free exchange', sub: 'for faulty items' },
      { icon: 'wallet', title: 'Refund to card', sub: 'within 5 business days' },
    ],
    sections: [
      {
        heading: 'How to return',
        body: 'Message us on WhatsApp (+234 803 555 0144) within 7 days of delivery with your order number and a photo of the item. We’ll reply with the next steps.',
      },
      {
        heading: 'Condition',
        body: 'Items must be unworn, unwashed and in their original packaging. Every adire piece is hand-dyed, so small differences in pattern are not a fault.',
      },
      {
        heading: 'Delivery costs',
        body: 'Exchanges are free for faulty items. For change-of-mind returns, you cover delivery back to our Surulere studio, or drop it off Monday–Saturday, 10am–6pm.',
      },
      {
        heading: 'Refunds',
        body: 'Refunds go back to your original payment method through Paystack within 5 business days of us receiving the item.',
      },
      {
        heading: 'Not returnable',
        body: 'Headwraps (gele) and custom orders, unless they arrive faulty.',
      },
    ],
  },
  {
    slug: 'delivery',
    title: 'Delivery',
    updated: 'Last updated 15 November 2026',
    sections: [
      {
        heading: 'Lagos',
        body: 'Delivery in Lagos takes 1–2 days and costs from ₦2,000 depending on your area. Orders over ₦40,000 ship free within Lagos.',
      },
      {
        heading: 'Other states',
        body: 'We ship nationwide through trusted couriers. Delivery to other states takes 3–5 days; the fee is shown at checkout.',
      },
      {
        heading: 'Pickup',
        body: 'Pick up free from our studio at 12 Adeniran Ogunsanya St, Surulere. Orders are ready within 24 hours, Monday–Saturday, 10am–6pm.',
      },
    ],
  },
  {
    slug: 'size-guide',
    title: 'Size guide',
    updated: 'Last updated 15 November 2026',
    sections: [
      {
        heading: 'Dresses & sets',
        body: 'S fits UK 8–10, M fits UK 12–14, L fits UK 16–18 and XL fits UK 20. Wrap styles adjust at the waist.',
      },
      {
        heading: 'Men',
        body: 'Kaftans and shirts are cut relaxed. M fits a 38–40″ chest, L 42–44″ and XL 46–48″.',
      },
      {
        heading: 'Not sure?',
        body: 'Send us your measurements on WhatsApp (+234 803 555 0144) and we’ll recommend a size.',
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    updated: 'Last updated 15 November 2026',
    sections: [
      {
        heading: 'What we collect',
        body: 'Your name, phone number, email (if you give it) and delivery address — only what we need to deliver your order and keep you updated.',
      },
      {
        heading: 'Payments',
        body: 'Payments are handled by Paystack. Your card details never touch this store.',
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of sale',
    updated: 'Last updated 15 November 2026',
    sections: [
      {
        heading: 'Prices',
        body: 'All prices are in Nigerian naira (₦) and include VAT where it applies. Delivery is charged separately at checkout.',
      },
      {
        heading: 'Hand-made pieces',
        body: 'Every piece is dyed or woven by hand. Colours and patterns vary slightly from the photos, which is part of the craft.',
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((p) => p.slug === slug);
}
