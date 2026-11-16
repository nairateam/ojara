import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { DeliveryService } from './delivery.service.js';

const settings = {
  deliveryEnabled: true,
  freeDeliveryOverKobo: 4_000_000,
  pickupEnabled: true,
  pickupAddress: '12 Market Road',
  pickupHours: 'Mon–Sat',
  orderReadyIn: '1 business day',
  sameDayCutoff: null,
  orderConfirmationNote: null,
};

function setup(zones: { id: string }[] = []) {
  const tx = {
    store: {
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn().mockResolvedValue(settings),
    },
    deliveryZone: {
      findMany: vi
        .fn()
        // update() first lists ids, read() then lists full rows.
        .mockResolvedValueOnce(zones)
        .mockResolvedValue([
          {
            id: 'z1',
            name: 'Mainland',
            areas: ['Yaba'],
            feeKobo: 200_000,
            eta: '1–2 days',
            isActive: true,
          },
          { id: 'z2', name: 'Island', areas: [], feeKobo: 250_000, eta: null, isActive: false },
        ]),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  return { service: new DeliveryService(prisma), tx };
}

const zone = (over: Record<string, unknown> = {}) => ({
  name: 'Mainland',
  areas: ['Yaba'],
  feeKobo: 200_000,
  eta: '1–2 days',
  isActive: true,
  ...over,
});

describe('DeliveryService', () => {
  it('updates kept zones, creates new ones and archives the rest, in order', async () => {
    const { service, tx } = setup([{ id: 'z1' }, { id: 'z-old' }]);
    await service.update('s1', 'u1', {
      ...settings,
      zones: [zone({ id: 'z1' }), zone({ name: 'Island', feeKobo: 250_000 })],
    });
    expect(tx.deliveryZone.update).toHaveBeenCalledWith({
      where: { id: 'z1' },
      data: expect.objectContaining({ name: 'Mainland', position: 0 }),
    });
    expect(tx.deliveryZone.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ storeId: 's1', name: 'Island', position: 1 }),
    });
    expect(tx.deliveryZone.updateMany).toHaveBeenCalledWith({
      where: { storeId: 's1', id: { in: ['z-old'] } },
      data: expect.objectContaining({ isActive: false }),
    });
  });

  it('treats an unknown zone id as a new zone (no cross-store updates)', async () => {
    const { service, tx } = setup([{ id: 'z1' }]);
    await service.update('s1', 'u1', { ...settings, zones: [zone({ id: 'someone-elses' })] });
    expect(tx.deliveryZone.update).not.toHaveBeenCalled();
    expect(tx.deliveryZone.create).toHaveBeenCalled();
  });

  it('shows shoppers only active zones and pickup when it’s on', async () => {
    const { service, tx } = setup();
    tx.deliveryZone.findMany.mockReset().mockResolvedValue([
      { id: 'z1', name: 'Mainland', areas: ['Yaba'], feeKobo: 200_000, eta: null, isActive: true },
      { id: 'z2', name: 'Island', areas: [], feeKobo: 250_000, eta: null, isActive: false },
    ]);
    const view = await service.forStorefront(tx as never, 's1');
    expect(view.zones.map((z) => z.name)).toEqual(['Mainland']);
    expect(view.pickup).toEqual({ address: '12 Market Road', hours: 'Mon–Sat' });
    expect(view.freeDeliveryOverKobo).toBe(4_000_000);
  });
});
