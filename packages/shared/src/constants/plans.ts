export const PLAN_KEYS = ['FREE', 'STARTER', 'PROFESSIONAL'] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export interface PlanLimits {
  /** Professional is "unlimited (fair use)", capped at 5,000 per the admin Plans screen (06.05). */
  maxProducts: number;
  maxImagesPerProduct: number;
  /** Maximum upload size per image in bytes. Enforced before a Cloudinary signature is issued. */
  maxImageBytes: number;
  customDomain: boolean;
  staffAccounts: number;
  removeBranding: boolean;
}

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  /** Monthly price in kobo (NGN 1 = 100 kobo). */
  priceKobo: number;
  limits: PlanLimits;
}

const MB = 1024 * 1024;

/** Values from the Pricing (01.04) and Admin Plans (06.05) designs. */
export const PLANS: Record<PlanKey, PlanDefinition> = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    tagline: 'For trying Ojara and your first online sales',
    priceKobo: 0,
    limits: {
      maxProducts: 20,
      maxImagesPerProduct: 3,
      maxImageBytes: 5 * MB,
      customDomain: false,
      staffAccounts: 1,
      removeBranding: false,
    },
  },
  STARTER: {
    key: 'STARTER',
    name: 'Starter',
    tagline: 'For growing sellers ready to look independent',
    priceKobo: 500_000,
    limits: {
      maxProducts: 200,
      maxImagesPerProduct: 6,
      maxImageBytes: 10 * MB,
      customDomain: true,
      staffAccounts: 1,
      removeBranding: true,
    },
  },
  PROFESSIONAL: {
    key: 'PROFESSIONAL',
    name: 'Professional',
    tagline: 'For busy stores with a team',
    priceKobo: 1_000_000,
    limits: {
      maxProducts: 5_000,
      maxImagesPerProduct: 10,
      maxImageBytes: 10 * MB,
      customDomain: true,
      staffAccounts: 5,
      removeBranding: true,
    },
  },
};

export const DEFAULT_PLAN_KEY: PlanKey = 'FREE';
