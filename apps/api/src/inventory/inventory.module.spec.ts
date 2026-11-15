import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';

describe('InventoryModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [InventoryService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(InventoryController)).toBeDefined();
    expect(moduleRef.get(InventoryService)).toBeDefined();
  });
});
