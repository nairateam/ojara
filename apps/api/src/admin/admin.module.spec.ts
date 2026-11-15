import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

describe('AdminModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [AdminService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(AdminController)).toBeDefined();
    expect(moduleRef.get(AdminService)).toBeDefined();
  });
});
