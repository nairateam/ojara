import type { FulfilmentStatus, PaymentStatus, PlanKey, ProductStatus } from '@ojara/shared';

/**
 * Sample merchant data for the dashboard screens (03.01–03.09, 04.01–04.03), copied from the
 * designs. Money is integer kobo. Replace with API data as each dashboard feature is built.
 */

const img = (n?: number) => `/mock/generated${n === undefined ? '' : `-${n}`}.jpg`;

export const MOCK_MERCHANT = {
  storeName: 'Adùnní Threads',
  slug: 'adunni',
  /** Public address as shown in the designs. */
  address: 'adunni.ojara.store',
  plan: 'FREE' as PlanKey,
  productCount: 18,
  owner: { name: 'Adùnní Ogunleye', firstName: 'Adùnní', role: 'Owner' },
  /** Orders waiting on the merchant (sidebar + tab bar count pill). */
  openOrders: 6,
  todayLabel: 'Saturday, 15 November',
};

/* ------------------------------------------------------------------------------------------ */
/* Home (03.01 / 04.01)                                                                        */
/* ------------------------------------------------------------------------------------------ */

export const HOME_KPIS = {
  sales: { kobo: 128_450_000, delta: '+12.4%', context: 'vs ₦1.14M last period' },
  orders: { count: 86, delta: '+9', context: '4 awaiting payment' },
  averageOrder: { kobo: 1_493_600, delta: '−2.1%', context: 'vs ₦15,256' },
  visits: { count: 3412, conversion: '2.5%' },
};

/** Paid sales per day for the last 14 days (kobo). The last entry is today. */
export const DAILY_SALES: { label: string; kobo: number; orders: number }[] = [
  { label: '2', kobo: 3_760_000, orders: 3 },
  { label: '3', kobo: 5_150_000, orders: 4 },
  { label: '4', kobo: 3_090_000, orders: 2 },
  { label: '5', kobo: 6_360_000, orders: 4 },
  { label: '6', kobo: 8_730_000, orders: 6 },
  { label: '7', kobo: 7_150_000, orders: 5 },
  { label: '8', kobo: 4_480_000, orders: 3 },
  { label: '9', kobo: 5_760_000, orders: 4 },
  { label: '10', kobo: 4_060_000, orders: 3 },
  { label: '11', kobo: 7_640_000, orders: 5 },
  { label: '12', kobo: 9_520_000, orders: 7 },
  { label: '13', kobo: 6_850_000, orders: 5 },
  { label: '14', kobo: 5_330_000, orders: 4 },
  { label: 'Today', kobo: 6_120_000, orders: 2 },
];

export type AttentionKind = 'fulfil' | 'payment' | 'stock';

export const NEEDS_ATTENTION: {
  kind: AttentionKind;
  title: string;
  detail: string;
  mobileDetail: string;
  href: string;
}[] = [
  {
    kind: 'fulfil',
    title: '6 orders to fulfil',
    detail: 'Oldest placed 2 days ago',
    mobileDetail: 'Oldest placed 2 days ago',
    href: '/orders?status=PENDING',
  },
  {
    kind: 'payment',
    title: '1 payment failed',
    detail: '#OJ-1044 · Ngozi Eze · ₦9,500',
    mobileDetail: '#OJ-1044 · Ngozi Eze',
    href: '/orders?order=OJ-1044',
  },
  {
    kind: 'stock',
    title: '3 products low on stock',
    detail: 'Adire Wrap Dress (M) has 2 left',
    mobileDetail: 'Adire Wrap Dress (M): 2 left',
    href: '/inventory?filter=low',
  },
];

export const BEST_SELLERS = [
  { name: 'Adire Wrap Dress', sold: 24, kobo: 44_400_000, image: img(), slug: 'adire-wrap-dress' },
  {
    name: 'Ankara Bucket Hat',
    sold: 31,
    kobo: 21_700_000,
    image: img(1),
    slug: 'ankara-bucket-hat',
  },
  { name: 'Aso-oke Gele', sold: 12, kobo: 16_800_000, image: img(2), slug: 'aso-oke-gele' },
  { name: 'Indigo Kaftan', sold: 9, kobo: 15_750_000, image: img(3), slug: 'indigo-kaftan' },
];

/* ------------------------------------------------------------------------------------------ */
/* Orders (03.03 / 04.02 / 04.03)                                                              */
/* ------------------------------------------------------------------------------------------ */

export interface OrderItem {
  name: string;
  /** Desktop variant line, e.g. "Size L · Indigo". */
  variant: string;
  /** Mobile variant line, e.g. "L · Indigo". */
  shortVariant: string;
  quantity: number;
  unitKobo: number;
  image: string;
}

export interface OrderStep {
  label: string;
  time?: string;
  state: 'done' | 'current' | 'todo';
}

export interface MockOrder {
  id: string;
  number: string;
  placed: string;
  /** Short placed time for mobile cards ("10:42", "Yesterday", "13 Nov"). */
  placedShort: string;
  group: 'today' | 'earlier';
  customer: string;
  customerId: string;
  method: 'Delivery' | 'Pickup';
  /** "Yaba, Lagos" for delivery, "Surulere studio" for pickup. */
  place: string;
  /** Short place for mobile cards ("Yaba", "Pickup"). */
  placeShort: string;
  totalKobo: number;
  payment: PaymentStatus;
  fulfilment: FulfilmentStatus;
  items: OrderItem[];
  deliveryKobo: number;
  deliveryZone?: string;
  address?: string;
  note?: string;
  placedSentence: string;
  paymentNote?: string;
  /** Payment failure details (00.07 error pattern). */
  failure?: { reason: string; attempted: string; reference: string };
  steps: OrderStep[];
  statusContext?: string;
}

const PRODUCT_IMAGES = {
  wrap: img(),
  hat: img(1),
  gele: img(2),
  kaftan: img(3),
  maxi: img(4),
  clutch: img(7),
  tote: img(8),
  twoPiece: img(9),
  shirt: img(10),
};

function steps(
  current: FulfilmentStatus,
  times: { placed: string; paid?: string; current?: string },
): OrderStep[] {
  const order: FulfilmentStatus[] = ['PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED'];
  const labels: Record<string, string> = {
    PROCESSING: 'Processing',
    READY_FOR_DISPATCH: 'Ready for dispatch',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
  };
  const idx = order.indexOf(current);
  const out: OrderStep[] = [{ label: 'Order placed', time: times.placed, state: 'done' }];
  out.push({
    label: 'Payment confirmed by Paystack',
    time: times.paid,
    state: times.paid ? 'done' : current === 'PENDING' ? 'current' : 'todo',
  });
  order.forEach((s, i) => {
    let state: OrderStep['state'] = 'todo';
    if (idx >= 0 && i < idx) state = 'done';
    if (i === idx) state = current === 'DELIVERED' ? 'done' : 'current';
    out.push({ label: labels[s] ?? s, time: i === idx ? times.current : undefined, state });
  });
  return out;
}

export const ORDER_STATUS_COUNTS: {
  key: 'ALL' | FulfilmentStatus;
  label: string;
  count: number;
}[] = [
  { key: 'ALL', label: 'All', count: 86 },
  { key: 'PENDING', label: 'Pending', count: 4 },
  { key: 'PROCESSING', label: 'Processing', count: 2 },
  { key: 'READY_FOR_DISPATCH', label: 'Ready', count: 3 },
  { key: 'SHIPPED', label: 'Shipped', count: 5 },
  { key: 'DELIVERED', label: 'Delivered', count: 68 },
  { key: 'CANCELLED', label: 'Cancelled', count: 3 },
];

export const ORDERS: MockOrder[] = [
  {
    id: 'OJ-1048',
    number: '#OJ-1048',
    placed: 'Today, 10:42',
    placedShort: '10:42',
    group: 'today',
    customer: 'Chiamaka Obi',
    customerId: 'chiamaka-obi',
    method: 'Delivery',
    place: 'Yaba, Lagos',
    placeShort: 'Yaba',
    totalKobo: 3_650_000,
    payment: 'PAID',
    fulfilment: 'PENDING',
    items: [
      {
        name: 'Adire Wrap Dress',
        variant: 'Size M · Indigo',
        shortVariant: 'M · Indigo',
        quantity: 1,
        unitKobo: 1_850_000,
        image: PRODUCT_IMAGES.wrap,
      },
      {
        name: 'Aso-oke Gele',
        variant: 'One size · Wine',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 1_400_000,
        image: PRODUCT_IMAGES.gele,
      },
    ],
    deliveryKobo: 400_000,
    deliveryZone: 'Mainland zone',
    address: '22 Herbert Macaulay Way, Yaba, Lagos',
    placedSentence: 'Placed today at 10:42 via storefront checkout',
    paymentNote: 'Paid via Paystack · Bank transfer · Ref PSK-8F3K2L',
    steps: steps('PENDING', { placed: 'Today, 10:42', paid: 'Today, 10:43' }),
    statusContext: 'Paid 10:43',
  },
  {
    id: 'OJ-1047',
    number: '#OJ-1047',
    placed: 'Today, 09:15',
    placedShort: '09:15',
    group: 'today',
    customer: 'Tunde Bakare',
    customerId: 'tunde-bakare',
    method: 'Delivery',
    place: 'Lekki, Lagos',
    placeShort: 'Lekki',
    totalKobo: 2_700_000,
    payment: 'PAID',
    fulfilment: 'PROCESSING',
    items: [
      {
        name: 'Indigo Kaftan',
        variant: 'Size L · Indigo',
        shortVariant: 'L · Indigo',
        quantity: 1,
        unitKobo: 1_750_000,
        image: PRODUCT_IMAGES.kaftan,
      },
      {
        name: 'Ankara Bucket Hat',
        variant: 'One size · Sunset print',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 700_000,
        image: PRODUCT_IMAGES.hat,
      },
    ],
    deliveryKobo: 250_000,
    deliveryZone: 'Lekki & VI zone',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    note: 'Please call before delivery — gate code is 2210.',
    placedSentence: 'Placed today at 09:15 via storefront checkout',
    paymentNote: 'Paid via Paystack · Card •••• 4821 · Ref PSK-7Q2M9X',
    steps: steps('PROCESSING', {
      placed: 'Today, 09:15',
      paid: 'Today, 09:16',
      current: 'Started 09:40 by Adùnní',
    }),
    statusContext: 'Started 09:40',
  },
  {
    id: 'OJ-1046',
    number: '#OJ-1046',
    placed: 'Yesterday, 18:20',
    placedShort: 'Yesterday',
    group: 'earlier',
    customer: 'Aisha Bello',
    customerId: 'aisha-bello',
    method: 'Delivery',
    place: 'Wuse 2, Abuja',
    placeShort: 'Abuja',
    totalKobo: 5_200_000,
    payment: 'PENDING',
    fulfilment: 'PENDING',
    items: [
      {
        name: 'Ankara Two-piece Set',
        variant: 'Size M · Sunset',
        shortVariant: 'M · Sunset',
        quantity: 1,
        unitKobo: 2_600_000,
        image: PRODUCT_IMAGES.twoPiece,
      },
      {
        name: 'Aso-oke Clutch',
        variant: 'One size · Gold',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 1_200_000,
        image: PRODUCT_IMAGES.clutch,
      },
      {
        name: 'Aso-oke Gele',
        variant: 'One size · Wine',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 900_000,
        image: PRODUCT_IMAGES.gele,
      },
    ],
    deliveryKobo: 500_000,
    deliveryZone: 'Abuja (interstate)',
    address: '7 Aminu Kano Crescent, Wuse 2, Abuja',
    placedSentence: 'Placed yesterday at 18:20 via storefront checkout',
    steps: steps('PENDING', { placed: 'Yesterday, 18:20' }),
    statusContext: 'Awaiting payment',
  },
  {
    id: 'OJ-1045',
    number: '#OJ-1045',
    placed: '13 Nov, 16:05',
    placedShort: '13 Nov',
    group: 'earlier',
    customer: 'Efe Okoro',
    customerId: 'efe-okoro',
    method: 'Pickup',
    place: 'Surulere studio',
    placeShort: 'Pickup',
    totalKobo: 2_400_000,
    payment: 'PAID',
    fulfilment: 'READY_FOR_DISPATCH',
    items: [
      {
        name: 'Adire Maxi Dress',
        variant: 'Size S · Indigo',
        shortVariant: 'S · Indigo',
        quantity: 1,
        unitKobo: 2_400_000,
        image: PRODUCT_IMAGES.maxi,
      },
    ],
    deliveryKobo: 0,
    placedSentence: 'Placed 13 Nov at 16:05 via storefront checkout',
    paymentNote: 'Paid via Paystack · Card •••• 1190 · Ref PSK-2M8D4C',
    steps: steps('READY_FOR_DISPATCH', {
      placed: '13 Nov, 16:05',
      paid: '13 Nov, 16:06',
      current: 'Ready for pickup since 14 Nov, 11:00',
    }),
    statusContext: 'Ready 14 Nov',
  },
  {
    id: 'OJ-1044',
    number: '#OJ-1044',
    placed: '13 Nov, 11:31',
    placedShort: '13 Nov',
    group: 'earlier',
    customer: 'Ngozi Eze',
    customerId: 'ngozi-eze',
    method: 'Delivery',
    place: 'Enugu',
    placeShort: 'Enugu',
    totalKobo: 950_000,
    payment: 'FAILED',
    fulfilment: 'CANCELLED',
    items: [
      {
        name: 'Adire Tote Bag',
        variant: 'One size · Indigo',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 950_000,
        image: PRODUCT_IMAGES.tote,
      },
    ],
    deliveryKobo: 0,
    deliveryZone: 'Enugu (interstate)',
    address: '4 Ogui Road, Enugu',
    placedSentence: 'Placed 13 Nov at 11:31 via storefront checkout',
    failure: {
      reason:
        'Paystack declined Ngozi’s card (insufficient funds). No money was taken and stock was released.',
      attempted: '13 Nov, 11:31',
      reference: 'PSK-3HD81Z',
    },
    steps: [
      { label: 'Order placed', time: '13 Nov, 11:31', state: 'done' },
      { label: 'Payment failed', time: '13 Nov, 11:31', state: 'current' },
    ],
    statusContext: 'Payment failed',
  },
  {
    id: 'OJ-1043',
    number: '#OJ-1043',
    placed: '12 Nov, 14:48',
    placedShort: '12 Nov',
    group: 'earlier',
    customer: 'Ibrahim Musa',
    customerId: 'ibrahim-musa',
    method: 'Delivery',
    place: 'Kano',
    placeShort: 'Kano',
    totalKobo: 4_100_000,
    payment: 'PAID',
    fulfilment: 'SHIPPED',
    items: [
      {
        name: 'Kampala Shirt',
        variant: 'Size L · Rust',
        shortVariant: 'L · Rust',
        quantity: 1,
        unitKobo: 1_500_000,
        image: PRODUCT_IMAGES.shirt,
      },
      {
        name: 'Ankara Two-piece Set',
        variant: 'Size L · Sunset',
        shortVariant: 'L · Sunset',
        quantity: 1,
        unitKobo: 2_100_000,
        image: PRODUCT_IMAGES.twoPiece,
      },
    ],
    deliveryKobo: 500_000,
    deliveryZone: 'North (interstate)',
    address: '18 Zaria Road, Kano',
    placedSentence: 'Placed 12 Nov at 14:48 via storefront checkout',
    paymentNote: 'Paid via Paystack · USSD · Ref PSK-9A1B7E',
    steps: steps('SHIPPED', {
      placed: '12 Nov, 14:48',
      paid: '12 Nov, 14:50',
      current: 'Sent with GIG Logistics 13 Nov',
    }),
    statusContext: 'Shipped 13 Nov',
  },
  {
    id: 'OJ-1042',
    number: '#OJ-1042',
    placed: '12 Nov, 09:02',
    placedShort: '12 Nov',
    group: 'earlier',
    customer: 'Folake Adeyemi',
    customerId: 'folake-adeyemi',
    method: 'Delivery',
    place: 'Ikeja, Lagos',
    placeShort: 'Ikeja',
    totalKobo: 1_850_000,
    payment: 'PAID',
    fulfilment: 'DELIVERED',
    items: [
      {
        name: 'Adire Wrap Dress',
        variant: 'Size M · Indigo',
        shortVariant: 'M · Indigo',
        quantity: 1,
        unitKobo: 1_850_000,
        image: PRODUCT_IMAGES.wrap,
      },
    ],
    deliveryKobo: 0,
    deliveryZone: 'Free delivery',
    address: '3 Allen Avenue, Ikeja, Lagos',
    placedSentence: 'Placed 12 Nov at 09:02 via storefront checkout',
    paymentNote: 'Paid via Paystack · Card •••• 3307 · Ref PSK-6T2N5W',
    steps: steps('DELIVERED', {
      placed: '12 Nov, 09:02',
      paid: '12 Nov, 09:03',
      current: '13 Nov, 15:20',
    }),
    statusContext: 'Delivered 13 Nov',
  },
  {
    id: 'OJ-1041',
    number: '#OJ-1041',
    placed: '11 Nov, 20:17',
    placedShort: '11 Nov',
    group: 'earlier',
    customer: 'Chiamaka Obi',
    customerId: 'chiamaka-obi',
    method: 'Pickup',
    place: 'Surulere studio',
    placeShort: 'Pickup',
    totalKobo: 1_400_000,
    payment: 'PAID',
    fulfilment: 'DELIVERED',
    items: [
      {
        name: 'Aso-oke Gele',
        variant: 'One size · Wine',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 1_400_000,
        image: PRODUCT_IMAGES.gele,
      },
    ],
    deliveryKobo: 0,
    placedSentence: 'Placed 11 Nov at 20:17 via storefront checkout',
    paymentNote: 'Paid via Paystack · Bank transfer · Ref PSK-1C4V8Q',
    steps: steps('DELIVERED', {
      placed: '11 Nov, 20:17',
      paid: '11 Nov, 20:18',
      current: 'Picked up 12 Nov',
    }),
    statusContext: 'Picked up 12 Nov',
  },
  {
    id: 'OJ-1040',
    number: '#OJ-1040',
    placed: '10 Nov, 13:40',
    placedShort: '10 Nov',
    group: 'earlier',
    customer: 'Kelechi Nwosu',
    customerId: 'kelechi-nwosu',
    method: 'Delivery',
    place: 'Port Harcourt',
    placeShort: 'Port Harcourt',
    totalKobo: 3_300_000,
    payment: 'REFUNDED',
    fulfilment: 'REFUNDED',
    items: [
      {
        name: 'Indigo Kaftan',
        variant: 'Size XL · Indigo',
        shortVariant: 'XL · Indigo',
        quantity: 1,
        unitKobo: 1_750_000,
        image: PRODUCT_IMAGES.kaftan,
      },
      {
        name: 'Ankara Bucket Hat',
        variant: 'One size · Sunset print',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 700_000,
        image: PRODUCT_IMAGES.hat,
      },
      {
        name: 'Aso-oke Clutch',
        variant: 'One size · Gold',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 400_000,
        image: PRODUCT_IMAGES.clutch,
      },
    ],
    deliveryKobo: 450_000,
    deliveryZone: 'South-South (interstate)',
    address: '9 Aba Road, Port Harcourt',
    placedSentence: 'Placed 10 Nov at 13:40 via storefront checkout',
    paymentNote: 'Refunded via Paystack · Ref PSK-0R7H3J',
    steps: [
      { label: 'Order placed', time: '10 Nov, 13:40', state: 'done' },
      { label: 'Payment confirmed by Paystack', time: '10 Nov, 13:41', state: 'done' },
      { label: 'Refunded', time: '11 Nov, 10:05 by Adùnní', state: 'current' },
    ],
    statusContext: 'Refunded 11 Nov',
  },
  {
    id: 'OJ-1039',
    number: '#OJ-1039',
    placed: '10 Nov, 08:55',
    placedShort: '10 Nov',
    group: 'earlier',
    customer: 'Bisola Ade',
    customerId: 'bisola-ade',
    method: 'Delivery',
    place: 'Ibadan',
    placeShort: 'Ibadan',
    totalKobo: 2_550_000,
    payment: 'PAID',
    fulfilment: 'DELIVERED',
    items: [
      {
        name: 'Adire Wrap Dress',
        variant: 'Size L · Rust',
        shortVariant: 'L · Rust',
        quantity: 1,
        unitKobo: 1_850_000,
        image: PRODUCT_IMAGES.wrap,
      },
      {
        name: 'Ankara Bucket Hat',
        variant: 'One size · Sunset print',
        shortVariant: 'One size',
        quantity: 1,
        unitKobo: 700_000,
        image: PRODUCT_IMAGES.hat,
      },
    ],
    deliveryKobo: 0,
    deliveryZone: 'Free delivery',
    address: '5 Ring Road, Ibadan',
    placedSentence: 'Placed 10 Nov at 08:55 via storefront checkout',
    paymentNote: 'Paid via Paystack · Card •••• 7713 · Ref PSK-5K9P2D',
    steps: steps('DELIVERED', {
      placed: '10 Nov, 08:55',
      paid: '10 Nov, 08:56',
      current: '12 Nov, 13:10',
    }),
    statusContext: 'Delivered 12 Nov',
  },
];

export function findOrder(id: string): MockOrder | undefined {
  const key = id.replace(/^#/, '').toUpperCase();
  return ORDERS.find((o) => o.id === key);
}

/* ------------------------------------------------------------------------------------------ */
/* Products (03.04 / 03.05)                                                                    */
/* ------------------------------------------------------------------------------------------ */

export interface MockProduct {
  slug: string;
  name: string;
  meta: string;
  category: string;
  priceKobo: number;
  stock: number;
  stockTag?: { label: string; tone: 'warning' | 'danger' };
  status: ProductStatus;
  image: string;
}

export const PRODUCT_TABS = [
  { key: 'ALL', label: 'All', count: 18 },
  { key: 'PUBLISHED', label: 'Published', count: 15 },
  { key: 'DRAFT', label: 'Drafts', count: 2 },
  { key: 'ARCHIVED', label: 'Archived', count: 1 },
] as const;

export const PRODUCTS: MockProduct[] = [
  {
    slug: 'adire-wrap-dress',
    name: 'Adire Wrap Dress',
    meta: '8 variants · ADW',
    category: 'Dresses',
    priceKobo: 1_850_000,
    stock: 23,
    stockTag: { label: '3 low', tone: 'warning' },
    status: 'PUBLISHED',
    image: img(),
  },
  {
    slug: 'ankara-two-piece-set',
    name: 'Ankara Two-piece Set',
    meta: '4 sizes · ATP',
    category: 'Dresses',
    priceKobo: 2_600_000,
    stock: 9,
    status: 'PUBLISHED',
    image: img(9),
  },
  {
    slug: 'aso-oke-gele',
    name: 'Aso-oke Gele',
    meta: 'One size · AOG',
    category: 'Headwear',
    priceKobo: 1_400_000,
    stock: 8,
    status: 'PUBLISHED',
    image: img(2),
  },
  {
    slug: 'indigo-kaftan',
    name: 'Indigo Kaftan',
    meta: '3 sizes · IKF',
    category: 'Men',
    priceKobo: 1_750_000,
    stock: 6,
    status: 'PUBLISHED',
    image: img(3),
  },
  {
    slug: 'ankara-bucket-hat',
    name: 'Ankara Bucket Hat',
    meta: 'One size · ABH',
    category: 'Headwear',
    priceKobo: 700_000,
    stock: 12,
    status: 'PUBLISHED',
    image: img(1),
  },
  {
    slug: 'kampala-shirt',
    name: 'Kampala Shirt',
    meta: '3 sizes · KPS',
    category: 'Men',
    priceKobo: 1_500_000,
    stock: 2,
    stockTag: { label: 'Low', tone: 'warning' },
    status: 'PUBLISHED',
    image: img(10),
  },
  {
    slug: 'aso-oke-clutch',
    name: 'Aso-oke Clutch',
    meta: 'One size · AOC',
    category: 'Fabrics & bags',
    priceKobo: 1_200_000,
    stock: 5,
    status: 'PUBLISHED',
    image: img(7),
  },
  {
    slug: 'adire-tote-bag',
    name: 'Adire Tote Bag',
    meta: 'One size · ATB',
    category: 'Fabrics & bags',
    priceKobo: 950_000,
    stock: 0,
    stockTag: { label: 'Sold out', tone: 'danger' },
    status: 'PUBLISHED',
    image: img(8),
  },
  {
    slug: 'adire-maxi-dress',
    name: 'Adire Maxi Dress',
    meta: 'Not published yet · ADM',
    category: 'Dresses',
    priceKobo: 2_400_000,
    stock: 0,
    status: 'DRAFT',
    image: img(4),
  },
];

export const PRODUCT_CATEGORIES = ['Dresses', 'Headwear', 'Men', 'Fabrics & bags'];

export interface MockVariant {
  size: string;
  colour: 'Indigo' | 'Rust';
  sku: string;
  priceKobo: number;
  stock: number;
  available: boolean;
}

export const COLOUR_SWATCHES: Record<MockVariant['colour'], string> = {
  Indigo: '#2A3A7C',
  Rust: '#B5532E',
};

export interface MockProductDetail {
  slug: string;
  name: string;
  status: ProductStatus;
  description: string;
  images: string[];
  priceKobo: number;
  costKobo: number;
  category: string;
  collections: string[];
  sizes: string[];
  colours: MockVariant['colour'][];
  variants: MockVariant[];
  lowStockAlert: number;
  trackStock: boolean;
  sellWhenSoldOut: boolean;
}

export const EDIT_PRODUCT: MockProductDetail = {
  slug: 'adire-wrap-dress',
  name: 'Adire Wrap Dress',
  status: 'PUBLISHED',
  description:
    'Hand-dyed adire wrap dress made in Abeokuta from 100% cotton. Adjustable waist tie, flutter sleeves and side pockets. Each piece is unique — pattern placement varies slightly.',
  images: [img(), img(4), img(5)],
  priceKobo: 1_850_000,
  costKobo: 920_000,
  category: 'Dresses',
  collections: ['New in', 'Adire edit'],
  sizes: ['S', 'M', 'L', 'XL'],
  colours: ['Indigo', 'Rust'],
  variants: [
    {
      size: 'S',
      colour: 'Indigo',
      sku: 'ADW-S-IND',
      priceKobo: 1_850_000,
      stock: 6,
      available: true,
    },
    {
      size: 'M',
      colour: 'Indigo',
      sku: 'ADW-M-IND',
      priceKobo: 1_850_000,
      stock: 2,
      available: true,
    },
    {
      size: 'L',
      colour: 'Indigo',
      sku: 'ADW-L-IND',
      priceKobo: 1_850_000,
      stock: 5,
      available: true,
    },
    {
      size: 'XL',
      colour: 'Indigo',
      sku: 'ADW-XL-IND',
      priceKobo: 1_950_000,
      stock: 0,
      available: false,
    },
    {
      size: 'S',
      colour: 'Rust',
      sku: 'ADW-S-RST',
      priceKobo: 1_850_000,
      stock: 3,
      available: true,
    },
    {
      size: 'M',
      colour: 'Rust',
      sku: 'ADW-M-RST',
      priceKobo: 1_850_000,
      stock: 4,
      available: true,
    },
    {
      size: 'L',
      colour: 'Rust',
      sku: 'ADW-L-RST',
      priceKobo: 1_850_000,
      stock: 2,
      available: true,
    },
    {
      size: 'XL',
      colour: 'Rust',
      sku: 'ADW-XL-RST',
      priceKobo: 1_950_000,
      stock: 1,
      available: true,
    },
  ],
  lowStockAlert: 3,
  trackStock: true,
  sellWhenSoldOut: false,
};

/** Builds a simple single-variant detail for products without full sample data. */
export function productDetail(slug: string): MockProductDetail | undefined {
  if (slug === EDIT_PRODUCT.slug) return EDIT_PRODUCT;
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return undefined;
  const code = p.meta.split('·').pop()?.trim() ?? 'SKU';
  return {
    slug: p.slug,
    name: p.name,
    status: p.status,
    description: `${p.name} from the Adùnní Threads studio in Abeokuta. Hand-finished in small batches.`,
    images: [p.image],
    priceKobo: p.priceKobo,
    costKobo: Math.round(p.priceKobo / 2 / 100) * 100,
    category: p.category,
    collections: ['New in'],
    sizes: ['One size'],
    colours: ['Indigo'],
    variants: [
      {
        size: 'One size',
        colour: 'Indigo',
        sku: `${code}-OS`,
        priceKobo: p.priceKobo,
        stock: p.stock,
        available: p.stock > 0,
      },
    ],
    lowStockAlert: 3,
    trackStock: true,
    sellWhenSoldOut: false,
  };
}

/* ------------------------------------------------------------------------------------------ */
/* Inventory (03.06)                                                                           */
/* ------------------------------------------------------------------------------------------ */

export const INVENTORY_KPIS = [
  { label: 'Units in stock', value: '142', context: 'across 41 variants', tone: 'default' },
  { label: 'Low stock', value: '6', context: 'variants at or below alert', tone: 'warning' },
  { label: 'Sold out', value: '4', context: 'hidden from customers', tone: 'danger' },
  { label: 'Stock value', value: '₦2.31M', context: 'at selling price', tone: 'default' },
] as const;

export interface InventoryRow {
  sku: string;
  product: string;
  variant: string;
  image: string;
  /** Saved stock level. */
  stock: number;
  /** Unsaved edit already in progress (shown with "was N"). */
  draft?: number;
  alertAt: number;
}

export const INVENTORY_COUNTS = { all: 41, low: 6, soldOut: 4 };

export const INVENTORY_DRAFT_NOTE = 'restock arrived from Abeokuta';

export const INVENTORY: InventoryRow[] = [
  {
    sku: 'ADW-M-IND',
    product: 'Adire Wrap Dress',
    variant: 'M / Indigo',
    image: img(),
    stock: 2,
    draft: 12,
    alertAt: 3,
  },
  {
    sku: 'ADW-XL-IND',
    product: 'Adire Wrap Dress',
    variant: 'XL / Indigo',
    image: img(),
    stock: 0,
    draft: 6,
    alertAt: 3,
  },
  {
    sku: 'ADW-S-RST',
    product: 'Adire Wrap Dress',
    variant: 'S / Rust',
    image: img(),
    stock: 3,
    alertAt: 3,
  },
  {
    sku: 'ADW-L-RST',
    product: 'Adire Wrap Dress',
    variant: 'L / Rust',
    image: img(),
    stock: 2,
    alertAt: 3,
  },
  {
    sku: 'ADW-XL-RST',
    product: 'Adire Wrap Dress',
    variant: 'XL / Rust',
    image: img(),
    stock: 1,
    alertAt: 3,
  },
  { sku: 'KPS-M', product: 'Kampala Shirt', variant: 'M', image: img(10), stock: 2, alertAt: 3 },
  { sku: 'KPS-L', product: 'Kampala Shirt', variant: 'L', image: img(10), stock: 0, alertAt: 3 },
  { sku: 'IKF-XL', product: 'Indigo Kaftan', variant: 'XL', image: img(3), stock: 1, alertAt: 3 },
  {
    sku: 'ATB-OS',
    product: 'Adire Tote Bag',
    variant: 'One size',
    image: img(8),
    stock: 0,
    alertAt: 3,
  },
];

export const STOCK_CHANGES: {
  title: string;
  detail: string;
  time: string;
  kind: 'order' | 'released' | 'restock';
}[] = [
  { title: 'Indigo Kaftan · L', detail: '−1 · Order #OJ-1047', time: 'Today 09:16', kind: 'order' },
  { title: 'Ankara Bucket Hat', detail: '−1 · Order #OJ-1047', time: 'Today 09:16', kind: 'order' },
  {
    title: 'Adire Tote Bag',
    detail: '+1 · #OJ-1044 payment failed, stock released',
    time: '13 Nov 11:33',
    kind: 'released',
  },
  {
    title: 'Ankara Bucket Hat',
    detail: '+10 · Restock by Adùnní',
    time: '12 Nov 15:02',
    kind: 'restock',
  },
  {
    title: 'Adire Wrap Dress · M / Indigo',
    detail: '−1 · Order #OJ-1042',
    time: '12 Nov 09:02',
    kind: 'order',
  },
];

/* ------------------------------------------------------------------------------------------ */
/* Customers (03.07)                                                                           */
/* ------------------------------------------------------------------------------------------ */

export interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tag?: 'Repeat' | 'New';
  orders: number;
  spentKobo: number;
  lastOrder: string;
  area: string;
  since: string;
  address: string;
  addressUses: number;
  pickups: number;
  history: { number: string; date: string; totalKobo: number; status: FulfilmentStatus }[];
}

export const CUSTOMER_TABS = [
  { key: 'all', label: 'All', count: 214 },
  { key: 'repeat', label: 'Repeat', count: 81 },
  { key: 'new', label: 'New this month', count: 23 },
  { key: 'quiet', label: 'Quiet for 60+ days', count: 47 },
] as const;

export const CUSTOMERS: MockCustomer[] = [
  {
    id: 'chiamaka-obi',
    name: 'Chiamaka Obi',
    phone: '+234 802 555 0137',
    email: 'chiamaka.obi@yahoo.com',
    tag: 'Repeat',
    orders: 6,
    spentKobo: 14_200_000,
    lastOrder: 'Today',
    area: 'Yaba, Lagos',
    since: '4 Mar 2026',
    address: '22 Herbert Macaulay Way, Yaba, Lagos',
    addressUses: 5,
    pickups: 1,
    history: [
      { number: '#OJ-1048', date: 'Today', totalKobo: 3_650_000, status: 'PENDING' },
      { number: '#OJ-1041', date: '11 Nov', totalKobo: 1_400_000, status: 'DELIVERED' },
      { number: '#OJ-1022', date: '28 Sep', totalKobo: 2_750_000, status: 'DELIVERED' },
      { number: '#OJ-1009', date: '2 Aug', totalKobo: 1_850_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'folake-adeyemi',
    name: 'Folake Adeyemi',
    phone: '+234 805 555 0168',
    email: 'folake.adeyemi@gmail.com',
    tag: 'Repeat',
    orders: 5,
    spentKobo: 9_600_000,
    lastOrder: '12 Nov',
    area: 'Ikeja, Lagos',
    since: '19 Apr 2026',
    address: '3 Allen Avenue, Ikeja, Lagos',
    addressUses: 5,
    pickups: 0,
    history: [
      { number: '#OJ-1042', date: '12 Nov', totalKobo: 1_850_000, status: 'DELIVERED' },
      { number: '#OJ-1030', date: '18 Oct', totalKobo: 2_600_000, status: 'DELIVERED' },
      { number: '#OJ-1017', date: '9 Sep', totalKobo: 1_750_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'bisola-ade',
    name: 'Bisola Ade',
    phone: '+234 816 555 0122',
    email: 'bisola.ade@gmail.com',
    tag: 'Repeat',
    orders: 4,
    spentKobo: 8_850_000,
    lastOrder: '10 Nov',
    area: 'Ibadan',
    since: '2 May 2026',
    address: '5 Ring Road, Ibadan',
    addressUses: 4,
    pickups: 0,
    history: [
      { number: '#OJ-1039', date: '10 Nov', totalKobo: 2_550_000, status: 'DELIVERED' },
      { number: '#OJ-1025', date: '4 Oct', totalKobo: 2_400_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'tunde-bakare',
    name: 'Tunde Bakare',
    phone: '+234 803 555 0192',
    email: 'tunde.bakare@gmail.com',
    tag: 'Repeat',
    orders: 3,
    spentKobo: 7_150_000,
    lastOrder: 'Today',
    area: 'Lekki, Lagos',
    since: '14 Jun 2026',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    addressUses: 3,
    pickups: 0,
    history: [
      { number: '#OJ-1047', date: 'Today', totalKobo: 2_700_000, status: 'PROCESSING' },
      { number: '#OJ-1028', date: '12 Oct', totalKobo: 2_600_000, status: 'DELIVERED' },
      { number: '#OJ-1011', date: '6 Aug', totalKobo: 1_850_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'ibrahim-musa',
    name: 'Ibrahim Musa',
    phone: '+234 806 555 0175',
    email: 'ibrahim.musa@outlook.com',
    tag: 'Repeat',
    orders: 2,
    spentKobo: 6_300_000,
    lastOrder: '12 Nov',
    area: 'Kano',
    since: '30 Jul 2026',
    address: '18 Zaria Road, Kano',
    addressUses: 2,
    pickups: 0,
    history: [
      { number: '#OJ-1043', date: '12 Nov', totalKobo: 4_100_000, status: 'SHIPPED' },
      { number: '#OJ-1019', date: '14 Sep', totalKobo: 2_200_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'aisha-bello',
    name: 'Aisha Bello',
    phone: '+234 809 555 0141',
    email: 'aisha.bello@gmail.com',
    tag: 'New',
    orders: 1,
    spentKobo: 5_200_000,
    lastOrder: 'Yesterday',
    area: 'Abuja',
    since: '14 Nov 2026',
    address: '7 Aminu Kano Crescent, Wuse 2, Abuja',
    addressUses: 1,
    pickups: 0,
    history: [{ number: '#OJ-1046', date: 'Yesterday', totalKobo: 5_200_000, status: 'PENDING' }],
  },
  {
    id: 'efe-okoro',
    name: 'Efe Okoro',
    phone: '+234 708 555 0119',
    email: 'efe.okoro@gmail.com',
    tag: 'Repeat',
    orders: 2,
    spentKobo: 4_100_000,
    lastOrder: '13 Nov',
    area: 'Surulere, Lagos',
    since: '21 Aug 2026',
    address: '11 Bode Thomas Street, Surulere, Lagos',
    addressUses: 0,
    pickups: 2,
    history: [
      { number: '#OJ-1045', date: '13 Nov', totalKobo: 2_400_000, status: 'READY_FOR_DISPATCH' },
      { number: '#OJ-1020', date: '17 Sep', totalKobo: 1_700_000, status: 'DELIVERED' },
    ],
  },
  {
    id: 'kelechi-nwosu',
    name: 'Kelechi Nwosu',
    phone: '+234 813 555 0150',
    email: 'kelechi.nwosu@gmail.com',
    orders: 1,
    spentKobo: 0,
    lastOrder: '10 Nov',
    area: 'Port Harcourt',
    since: '10 Nov 2026',
    address: '9 Aba Road, Port Harcourt',
    addressUses: 1,
    pickups: 0,
    history: [{ number: '#OJ-1040', date: '10 Nov', totalKobo: 3_300_000, status: 'REFUNDED' }],
  },
  {
    id: 'ngozi-eze',
    name: 'Ngozi Eze',
    phone: '+234 817 555 0103',
    email: 'ngozi.eze@gmail.com',
    orders: 0,
    spentKobo: 0,
    lastOrder: '13 Nov',
    area: 'Enugu',
    since: '13 Nov 2026',
    address: '4 Ogui Road, Enugu',
    addressUses: 0,
    pickups: 0,
    history: [{ number: '#OJ-1044', date: '13 Nov', totalKobo: 950_000, status: 'CANCELLED' }],
  },
];

/* ------------------------------------------------------------------------------------------ */
/* Reports (03.08)                                                                             */
/* ------------------------------------------------------------------------------------------ */

export const REPORT_RANGE = '1 Oct – 15 Nov 2026';

export const REPORT_KPIS = [
  { label: 'Revenue', value: '₦2,146,000', context: '+18% vs Aug–Sep', tone: 'success' },
  { label: 'Paid orders', value: '142', context: '+21', tone: 'success' },
  { label: 'Average order', value: '₦15,113', context: '−2%', tone: 'danger' },
  { label: 'Returning customers', value: '38%', context: 'of buyers ordered again', tone: 'muted' },
] as const;

export const WEEKLY_REVENUE = [
  { label: '1 Oct', kobo: 21_000_000 },
  { label: '8 Oct', kobo: 26_500_000 },
  { label: '15 Oct', kobo: 24_000_000 },
  { label: '22 Oct', kobo: 31_000_000 },
  { label: '29 Oct', kobo: 28_500_000 },
  { label: '5 Nov', kobo: 37_200_000 },
  { label: '12 Nov', kobo: 46_400_000 },
];

export const PAYMENT_METHODS = [
  { label: 'Card', pct: 58 },
  { label: 'Bank transfer', pct: 31 },
  { label: 'USSD', pct: 11 },
];

export const TOP_PRODUCTS = [
  { name: 'Adire Wrap Dress', sold: 41, kobo: 75_850_000, image: img() },
  { name: 'Ankara Bucket Hat', sold: 52, kobo: 36_400_000, image: img(1) },
  { name: 'Indigo Kaftan', sold: 18, kobo: 31_500_000, image: img(3) },
  { name: 'Aso-oke Gele', sold: 19, kobo: 26_600_000, image: img(2) },
  { name: 'Ankara Two-piece Set', sold: 9, kobo: 23_400_000, image: img(9) },
];

export const REGIONS = [
  { label: 'Lagos', pct: 71 },
  { label: 'Abuja (FCT)', pct: 9 },
  { label: 'Rivers', pct: 6 },
  { label: 'Oyo', pct: 5 },
  { label: 'Other states', pct: 9 },
];

/* ------------------------------------------------------------------------------------------ */
/* Categories (03.09)                                                                          */
/* ------------------------------------------------------------------------------------------ */

export interface MockCategory {
  id: string;
  name: string;
  description: string;
  products: number;
  inMenu: boolean;
  image: string;
  items: { name: string; priceKobo: number; image: string }[];
}

export const CATEGORIES: MockCategory[] = [
  {
    id: 'dresses',
    name: 'Dresses',
    description: 'Wrap, maxi and shift dresses',
    products: 6,
    inMenu: true,
    image: img(4),
    items: [
      { name: 'Adire Wrap Dress', priceKobo: 1_850_000, image: img() },
      { name: 'Ankara Two-piece Set', priceKobo: 2_600_000, image: img(9) },
      { name: 'Adire Maxi Dress', priceKobo: 2_400_000, image: img(4) },
      { name: 'Kampala Shift Dress', priceKobo: 1_600_000, image: img(5) },
    ],
  },
  {
    id: 'headwear',
    name: 'Headwear',
    description: 'Gele, bucket hats and wraps',
    products: 5,
    inMenu: true,
    image: img(2),
    items: [
      { name: 'Aso-oke Gele', priceKobo: 1_400_000, image: img(2) },
      { name: 'Ankara Bucket Hat', priceKobo: 700_000, image: img(1) },
    ],
  },
  {
    id: 'men',
    name: 'Men',
    description: 'Kaftans and shirts',
    products: 3,
    inMenu: true,
    image: img(3),
    items: [
      { name: 'Indigo Kaftan', priceKobo: 1_750_000, image: img(3) },
      { name: 'Kampala Shirt', priceKobo: 1_500_000, image: img(10) },
    ],
  },
  {
    id: 'fabrics-bags',
    name: 'Fabrics & bags',
    description: 'Adire by the yard, totes, clutches',
    products: 4,
    inMenu: true,
    image: img(5),
    items: [
      { name: 'Aso-oke Clutch', priceKobo: 1_200_000, image: img(7) },
      { name: 'Adire Tote Bag', priceKobo: 950_000, image: img(8) },
    ],
  },
];

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  dresses: 'Wrap, maxi and shift dresses — hand-dyed, made to order in small batches.',
};

export const ARCHIVED_CATEGORIES = [
  { name: 'Ramadan edit 2026', detail: 'Archived 2 Apr · hidden from your store · 0 products' },
];

/* ------------------------------------------------------------------------------------------ */
/* Notifications (03.02)                                                                       */
/* ------------------------------------------------------------------------------------------ */

export type NotificationKind = 'order' | 'failed' | 'stock' | 'payout' | 'ojara';

export interface MockNotification {
  id: string;
  kind: NotificationKind;
  /** Tab the item belongs to. */
  tab: 'orders' | 'stock' | 'ojara';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href: string;
}

export const NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    kind: 'order',
    tab: 'orders',
    title: 'New paid order · ₦36,500',
    body: '#OJ-1048 from Chiamaka Obi · 2 items',
    time: '9 min ago',
    unread: true,
    href: '/orders?order=OJ-1048',
  },
  {
    id: 'n2',
    kind: 'failed',
    tab: 'orders',
    title: 'Payment failed',
    body: '#OJ-1044 · Ngozi’s card was declined. Send a new link?',
    time: '2 days ago',
    unread: true,
    href: '/orders?order=OJ-1044',
  },
  {
    id: 'n3',
    kind: 'stock',
    tab: 'stock',
    title: 'Low stock: Adire Wrap Dress',
    body: 'M / Indigo has 2 left',
    time: 'Yesterday',
    unread: true,
    href: '/inventory?filter=low',
  },
  {
    id: 'n4',
    kind: 'payout',
    tab: 'orders',
    title: 'Payout sent · ₦118,300',
    body: 'To GTBank ••6789',
    time: 'Fri 14 Nov',
    unread: false,
    href: '/payments',
  },
  {
    id: 'n5',
    kind: 'ojara',
    tab: 'ojara',
    title: 'From Ojara: Black Friday tips',
    body: '5 ways to get your store ready for the busiest week of the year',
    time: 'Thu 13 Nov',
    unread: true,
    href: '/help',
  },
];
