/**
 * Typed wrapper around the Paystack REST API. SKELETON: method signatures are fixed so callers can
 * be written against them; implementations land with the checkout / billing features.
 * Amounts are always integer kobo (Paystack's native unit for NGN).
 */
export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet`);
    this.name = 'NotImplementedError';
  }
}

export interface InitializeTransactionInput {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  /** Merchant subaccount code if funds are routed directly (open question, see DECISIONS.md). */
  subaccount?: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyTransactionResult {
  reference: string;
  status: 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | 'reversed';
  amountKobo: number;
  paidAt: string | null;
  raw: unknown;
}

export interface CreateSubaccountInput {
  businessName: string;
  settlementBank: string;
  accountNumber: string;
  percentageCharge: number;
}

export interface CreatePlanInput {
  name: string;
  amountKobo: number;
  interval: 'monthly' | 'annually';
}

export interface CreateSubscriptionInput {
  customerEmail: string;
  planCode: string;
}

export class PaystackClient {
  static readonly BASE_URL = 'https://api.paystack.co';

  constructor(private readonly secretKey: string | undefined) {}

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  initializeTransaction(_input: InitializeTransactionInput): Promise<InitializeTransactionResult> {
    // TODO(checkout): POST /transaction/initialize
    return Promise.reject(new NotImplementedError('Paystack initializeTransaction'));
  }

  verifyTransaction(_reference: string): Promise<VerifyTransactionResult> {
    // TODO(checkout): GET /transaction/verify/:reference (used by reconciliation, not as truth)
    return Promise.reject(new NotImplementedError('Paystack verifyTransaction'));
  }

  createSubaccount(_input: CreateSubaccountInput): Promise<{ subaccountCode: string }> {
    // TODO(payouts): POST /subaccount, only if Ojara routes funds directly to merchants
    return Promise.reject(new NotImplementedError('Paystack createSubaccount'));
  }

  createPlan(_input: CreatePlanInput): Promise<{ planCode: string }> {
    // TODO(billing): POST /plan
    return Promise.reject(new NotImplementedError('Paystack createPlan'));
  }

  createSubscription(_input: CreateSubscriptionInput): Promise<{ subscriptionCode: string }> {
    // TODO(billing): POST /subscription
    return Promise.reject(new NotImplementedError('Paystack createSubscription'));
  }
}
