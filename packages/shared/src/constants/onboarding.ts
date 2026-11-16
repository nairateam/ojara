/** "What do you sell?" (onboarding step 1). Stored as the id on the store. */
export const STORE_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & clothing' },
  { id: 'beauty', label: 'Beauty & skincare' },
  { id: 'food', label: 'Food & groceries' },
  { id: 'electronics', label: 'Electronics & gadgets' },
  { id: 'home', label: 'Home & lifestyle' },
  { id: 'general', label: 'General retail' },
] as const;
export type StoreCategory = (typeof STORE_CATEGORIES)[number]['id'];
export const STORE_CATEGORY_IDS = STORE_CATEGORIES.map((c) => c.id) as [
  StoreCategory,
  ...StoreCategory[],
];

/** The 36 states and the Federal Capital Territory. */
export const NIGERIAN_STATES = [
  'Abia',
  'Abuja (FCT)',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;
export type NigerianState = (typeof NIGERIAN_STATES)[number];

/**
 * Onboarding steps, 1-based: business details, store address & brand, first products, payments,
 * delivery, publish. A store's `onboardingStep` is the furthest step the merchant has reached.
 */
export const ONBOARDING_STEP_COUNT = 6;
