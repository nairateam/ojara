import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { DeliveryController } from './delivery.controller.js';
import { DeliveryService } from './delivery.service.js';

describe('DeliveryModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [DeliveryService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(DeliveryController)).toBeDefined();
    expect(moduleRef.get(DeliveryService)).toBeDefined();
  });
});
