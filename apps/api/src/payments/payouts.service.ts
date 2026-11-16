import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  type PayoutAccountDto,
  type PayoutAccountInput,
  type PayoutBankDto,
  PLANS,
} from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import {
  type PaystackBank,
  PaystackClient,
  PaystackError,
  PaystackNotConfiguredError,
} from './paystack.client.js';

const BANKS_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Merchant payout accounts (DECISIONS.md: Paystack subaccounts). Linking a bank account creates
 * (or updates) the store's Paystack subaccount, so sales settle to the merchant directly; Ojara's
 * share is the plan's `transactionFeePercent` (0 for now). Runs in the store's tenant context.
 */
@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  private banksCache: { at: number; banks: PaystackBank[] } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackClient,
  ) {}

  /** Paystack failures as merchant-facing errors (bad details → 400, outage → 503). */
  private toHttp(err: unknown, fallback: string): never {
    if (err instanceof PaystackNotConfiguredError) {
      throw new ServiceUnavailableException('Payments aren’t set up on this server yet.');
    }
    // 403 means Paystack won't let *Ojara's* business do this yet (e.g. subaccounts need the
    // Paystack business to be activated) — not a problem with the merchant's details.
    if (err instanceof PaystackError && err.status === 403) {
      this.logger.warn(`Paystack refused the request (403): ${err.message}`);
      throw new ServiceUnavailableException(
        'Payouts can’t be set up right now. Please try again later.',
      );
    }
    if (err instanceof PaystackError && err.status >= 400 && err.status < 500) {
      throw new BadRequestException(fallback);
    }
    this.logger.error(`Paystack call failed: ${String(err)}`);
    throw new ServiceUnavailableException('Paystack isn’t responding. Please try again shortly.');
  }

  async banks(): Promise<PayoutBankDto[]> {
    if (this.banksCache && Date.now() - this.banksCache.at < BANKS_TTL_MS) {
      return this.banksCache.banks;
    }
    try {
      const banks = await this.paystack.listBanks();
      this.banksCache = { at: Date.now(), banks };
      return banks;
    } catch (err) {
      return this.toHttp(err, 'Couldn’t load the bank list.');
    }
  }

  async resolve(bankCode: string, accountNumber: string): Promise<{ accountName: string }> {
    try {
      return await this.paystack.resolveAccount(accountNumber, bankCode);
    } catch (err) {
      return this.toHttp(err, 'We couldn’t find that account. Check the number and the bank.');
    }
  }

  async get(storeId: string): Promise<PayoutAccountDto> {
    const store = await this.prisma.db.store.findUniqueOrThrow({
      where: { id: storeId },
      select: {
        paystackSubaccountCode: true,
        payoutBankName: true,
        payoutAccountName: true,
        payoutAccountLast4: true,
        payoutConnectedAt: true,
        plan: { select: { key: true } },
      },
    });
    return {
      connected: Boolean(store.paystackSubaccountCode),
      bankName: store.payoutBankName,
      accountName: store.payoutAccountName,
      accountLast4: store.payoutAccountLast4,
      connectedAt: store.payoutConnectedAt?.toISOString() ?? null,
      platformFeePercent: PLANS[store.plan.key].limits.transactionFeePercent,
      testMode: this.paystack.isTestMode,
    };
  }

  /**
   * Links (or changes) the payout account. The account name always comes from Paystack, never
   * from the browser, and is what the merchant sees back.
   */
  async connect(
    storeId: string,
    actorId: string,
    input: PayoutAccountInput,
  ): Promise<PayoutAccountDto> {
    const bank = (await this.banks()).find((b) => b.code === input.bankCode);
    if (!bank) throw new BadRequestException('Choose a bank from the list.');
    const { accountName } = await this.resolve(input.bankCode, input.accountNumber);

    const store = await this.prisma.db.store.findUniqueOrThrow({
      where: { id: storeId },
      select: { name: true, paystackSubaccountCode: true, plan: { select: { key: true } } },
    });
    const subaccount = {
      businessName: store.name,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      percentageCharge: PLANS[store.plan.key].limits.transactionFeePercent,
    };
    let code = store.paystackSubaccountCode;
    try {
      if (code) await this.paystack.updateSubaccount(code, subaccount);
      else code = (await this.paystack.createSubaccount(subaccount)).subaccountCode;
    } catch (err) {
      return this.toHttp(err, 'Paystack couldn’t set up payouts to that account.');
    }

    await this.prisma.tenantTransaction(async (tx) => {
      await tx.store.update({
        where: { id: storeId },
        data: {
          paystackSubaccountCode: code,
          payoutBankCode: bank.code,
          payoutBankName: bank.name,
          payoutAccountName: accountName,
          payoutAccountLast4: input.accountNumber.slice(-4),
          payoutConnectedAt: new Date(),
        },
      });
      await tx.auditLog.create({
        data: {
          storeId,
          actorId,
          action: store.paystackSubaccountCode ? 'payouts.changed' : 'payouts.connected',
          entity: 'Store',
          entityId: storeId,
          metadata: { bank: bank.name, last4: input.accountNumber.slice(-4) },
        },
      });
    });
    return this.get(storeId);
  }
}
