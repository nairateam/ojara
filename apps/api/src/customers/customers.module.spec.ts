import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';

describe('CustomersModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: {} },
        { provide: AppConfigService, useValue: { env: {} } },
      ],
    }).compile();
    expect(moduleRef.get(CustomersController)).toBeDefined();
    expect(moduleRef.get(CustomersService)).toBeDefined();
  });
});
