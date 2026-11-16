import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { nextStatuses, OrdersService } from './orders.service.js';

describe('nextStatuses', () => {
  it('only lets unpaid orders be cancelled', () => {
    expect(nextStatuses('PENDING', 'PENDING')).toEqual(['CANCELLED']);
    expect(nextStatuses('FAILED', 'CANCELLED')).toEqual([]);
  });

  it('moves paid orders forward and stops cancelling once shipped', () => {
    expect(nextStatuses('PAID', 'PROCESSING')).toContain('SHIPPED');
    expect(nextStatuses('PAID', 'SHIPPED')).toEqual(['DELIVERED']);
    expect(nextStatuses('PAID', 'DELIVERED')).toEqual([]);
  });
});

describe('OrdersService.updateFulfilment', () => {
  it('refuses a move the order can’t make', async () => {
    const tx = {
      order: {
        findFirst: vi
          .fn()
          .mockResolvedValue({ paymentStatus: 'PENDING', fulfilmentStatus: 'PENDING' }),
        update: vi.fn(),
      },
      auditLog: { create: vi.fn() },
    };
    const prisma = {
      tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    } as unknown as PrismaService;
    await expect(
      new OrdersService(prisma).updateFulfilment('s1', 'u1', 'o1', 'SHIPPED'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.order.update).not.toHaveBeenCalled();
  });
});
