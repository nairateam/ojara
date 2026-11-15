import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: {} },
        { provide: AppConfigService, useValue: { env: {} } },
      ],
    }).compile();
    expect(moduleRef.get(OrdersController)).toBeDefined();
    expect(moduleRef.get(OrdersService)).toBeDefined();
  });
});
