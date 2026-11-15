import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { DomainsController } from './domains.controller.js';
import { DomainsService } from './domains.service.js';

describe('DomainsModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DomainsController],
      providers: [DomainsService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(DomainsController)).toBeDefined();
    expect(moduleRef.get(DomainsService)).toBeDefined();
  });
});
