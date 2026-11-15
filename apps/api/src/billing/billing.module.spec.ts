import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';

describe('BillingModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [BillingService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(BillingController)).toBeDefined();
    expect(moduleRef.get(BillingService)).toBeDefined();
  });
});
