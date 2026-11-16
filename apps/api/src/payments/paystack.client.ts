/**
 * Typed wrapper around the Paystack REST API. Amounts are always integer kobo (Paystack's native
 * unit for NGN). Every call has a timeout; failures throw PaystackError with Paystack's message.
 */
export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet`);
    this.name = 'NotImplementedError';
  }
}

export class PaystackNotConfiguredError extends Error {
  constructor() {
    super('Paystack is not configured (set PAYSTACK_SECRET_KEY)');
    this.name = 'PaystackNotConfiguredError';
  }
}

/** A Paystack API error. `status` is the HTTP status (0 when the request didn't complete). */
export class PaystackError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'PaystackError';
  }
}

export interface InitializeTransactionInput {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  /** Merchant subaccount: Paystack settles the sale to the merchant directly. */
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

export interface PaystackBank {
  name: string;
  code: string;
}

export interface SubaccountInput {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  /** Ojara's share of each sale, in percent (0 = merchant keeps everything after Paystack fees). */
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

interface Envelope<T> {
  status: boolean;
  message: string;
  data: T;
}

export class PaystackClient {
  static readonly BASE_URL = 'https://api.paystack.co';

  constructor(
    private readonly secretKey: string | undefined,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.secretKey) throw new PaystackNotConfiguredError();
    let res: Response;
    try {
      res = await this.fetchImpl(`${PaystackClient.BASE_URL}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.secretKey}`,
          ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : null,
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new PaystackError('Couldn’t reach Paystack. Please try again.', 0);
    }
    const json = (await res.json().catch(() => null)) as Envelope<T> | null;
    if (!res.ok || !json?.status) {
      throw new PaystackError(
        json?.message ?? `Paystack request failed (${res.status})`,
        res.status,
      );
    }
    return json.data;
  }

  /** Nigerian banks that can receive payouts (NUBAN), for the "Get paid" bank picker. */
  async listBanks(): Promise<PaystackBank[]> {
    const banks = await this.request<{ name: string; code: string; active: boolean }[]>(
      'GET',
      '/bank?country=nigeria&currency=NGN&perPage=100',
    );
    // Paystack's test bank (001) can be resolved but can't be a subaccount's settlement bank, so it
    // isn't offered even in test mode: subaccounts need a real bank account in both modes.
    return banks.filter((b) => b.active).map((b) => ({ name: b.name, code: b.code }));
  }

  get isTestMode(): boolean {
    return Boolean(this.secretKey?.startsWith('sk_test_'));
  }

  /** The registered name on an account; throws PaystackError (422/400) when it doesn't resolve. */
  async resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string }> {
    const data = await this.request<{ account_name: string }>(
      'GET',
      `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    );
    return { accountName: data.account_name };
  }

  async createSubaccount(input: SubaccountInput): Promise<{ subaccountCode: string }> {
    const data = await this.request<{ subaccount_code: string }>('POST', '/subaccount', {
      business_name: input.businessName,
      settlement_bank: input.bankCode,
      account_number: input.accountNumber,
      percentage_charge: input.percentageCharge,
    });
    return { subaccountCode: data.subaccount_code };
  }

  async updateSubaccount(code: string, input: SubaccountInput): Promise<void> {
    await this.request('PUT', `/subaccount/${encodeURIComponent(code)}`, {
      business_name: input.businessName,
      settlement_bank: input.bankCode,
      account_number: input.accountNumber,
      percentage_charge: input.percentageCharge,
    });
  }

  initializeTransaction(_input: InitializeTransactionInput): Promise<InitializeTransactionResult> {
    // TODO(checkout): POST /transaction/initialize
    return Promise.reject(new NotImplementedError('Paystack initializeTransaction'));
  }

  verifyTransaction(_reference: string): Promise<VerifyTransactionResult> {
    // TODO(checkout): GET /transaction/verify/:reference (used by reconciliation, not as truth)
    return Promise.reject(new NotImplementedError('Paystack verifyTransaction'));
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
