import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { PaystackClient, PaystackError } from './paystack.client.js';
import { PayoutsService } from './payouts.service.js';

function fakeFetch(routes: Record<string, { status?: number; body: unknown }>) {
  return vi.fn((url: string) => {
    const path = url.replace(PaystackClient.BASE_URL, '');
    const key = Object.keys(routes).find((k) => path.startsWith(k));
    const route = key ? routes[key]! : { status: 404, body: { status: false, message: 'nope' } };
    return Promise.resolve(
      new Response(JSON.stringify(route.body), { status: route.status ?? 200 }),
    );
  }) as unknown as typeof fetch;
}

describe('PaystackClient', () => {
  it('lists active banks only', async () => {
    const fetch = fakeFetch({
      '/bank?': {
        body: {
          status: true,
          message: 'ok',
          data: [
            { name: 'Access Bank', code: '044', active: true },
            { name: 'Old Bank', code: '999', active: false },
          ],
        },
      },
    });
    expect(await new PaystackClient('sk_test_x', fetch).listBanks()).toEqual([
      { name: 'Access Bank', code: '044' },
    ]);
    expect(await new PaystackClient('sk_live_x', fetch).listBanks()).toEqual([
      { name: 'Access Bank', code: '044' },
    ]);
  });

  it('turns Paystack failures into PaystackError with the HTTP status', async () => {
    const fetch = fakeFetch({
      '/bank/resolve': {
        status: 422,
        body: { status: false, message: 'Could not resolve account name' },
      },
    });
    const err = await new PaystackClient('sk_test_x', fetch)
      .resolveAccount('0123456789', '044')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PaystackError);
    expect(err).toMatchObject({ status: 422, message: 'Could not resolve account name' });
  });

  it('creates a subaccount with the platform share', async () => {
    const fetch = fakeFetch({
      '/subaccount': { body: { status: true, message: 'ok', data: { subaccount_code: 'ACCT_1' } } },
    });
    const client = new PaystackClient('sk_test_x', fetch);
    await expect(
      client.createSubaccount({
        businessName: 'Ada Bakes',
        bankCode: '044',
        accountNumber: '0123456789',
        percentageCharge: 0,
      }),
    ).resolves.toEqual({ subaccountCode: 'ACCT_1' });
    const [, init] = (fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]!;
    expect(JSON.parse(init.body as string)).toEqual({
      business_name: 'Ada Bakes',
      settlement_bank: '044',
      account_number: '0123456789',
      percentage_charge: 0,
    });
  });
});

function setup(existingCode: string | null = null) {
  const paystack = {
    isTestMode: true,
    listBanks: vi.fn().mockResolvedValue([{ name: 'Access Bank', code: '044' }]),
    resolveAccount: vi.fn().mockResolvedValue({ accountName: 'ADA OKAFOR' }),
    createSubaccount: vi.fn().mockResolvedValue({ subaccountCode: 'ACCT_NEW' }),
    updateSubaccount: vi.fn().mockResolvedValue(undefined),
  };
  const store = {
    name: 'Ada Bakes',
    paystackSubaccountCode: existingCode,
    payoutBankName: null,
    payoutAccountName: null,
    payoutAccountLast4: null,
    payoutConnectedAt: null,
    plan: { key: 'FREE' },
  };
  const tx = {
    store: { update: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    db: { store: { findUniqueOrThrow: vi.fn().mockResolvedValue(store) } },
    tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  return {
    service: new PayoutsService(prisma, paystack as unknown as PaystackClient),
    paystack,
    tx,
  };
}

describe('PayoutsService', () => {
  it('creates a subaccount with the Paystack account name and stores only the last 4 digits', async () => {
    const { service, paystack, tx } = setup();
    await service.connect('s1', 'u1', { bankCode: '044', accountNumber: '0123456789' });
    expect(paystack.createSubaccount).toHaveBeenCalledWith({
      businessName: 'Ada Bakes',
      bankCode: '044',
      accountNumber: '0123456789',
      percentageCharge: 0,
    });
    expect(tx.store.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: expect.objectContaining({
        paystackSubaccountCode: 'ACCT_NEW',
        payoutBankName: 'Access Bank',
        payoutAccountName: 'ADA OKAFOR',
        payoutAccountLast4: '6789',
      }),
    });
    const data = (tx.store.update.mock.calls[0] as [{ data: Record<string, unknown> }])[0].data;
    expect(JSON.stringify(data)).not.toContain('0123456789');
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'payouts.connected' }),
    });
  });

  it('updates the existing subaccount when the account changes', async () => {
    const { service, paystack } = setup('ACCT_OLD');
    await service.connect('s1', 'u1', { bankCode: '044', accountNumber: '0123456789' });
    expect(paystack.updateSubaccount).toHaveBeenCalledWith('ACCT_OLD', expect.any(Object));
    expect(paystack.createSubaccount).not.toHaveBeenCalled();
  });

  it('rejects banks that aren’t in the list and accounts Paystack can’t resolve', async () => {
    const { service, paystack } = setup();
    await expect(
      service.connect('s1', 'u1', { bankCode: '999', accountNumber: '0123456789' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    paystack.resolveAccount.mockRejectedValue(new PaystackError('Could not resolve', 422));
    await expect(
      service.connect('s1', 'u1', { bankCode: '044', accountNumber: '0123456789' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(paystack.createSubaccount).not.toHaveBeenCalled();
  });

  it('reports a Paystack outage as 503', async () => {
    const { service, paystack } = setup();
    paystack.listBanks.mockRejectedValue(new PaystackError('down', 0));
    await expect(service.banks()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('PayoutsService when Paystack refuses Ojara’s business', () => {
  it('reports a 403 as a temporary platform problem, not bad account details', async () => {
    const { service, paystack } = setup();
    paystack.createSubaccount.mockRejectedValue(
      new PaystackError('Sorry, We cannot add subaccount at the moment', 403),
    );
    await expect(
      service.connect('s1', 'u1', { bankCode: '044', accountNumber: '0123456789' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
