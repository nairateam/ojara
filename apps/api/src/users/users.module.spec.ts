import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersModule (shell)', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(moduleRef.get(UsersController)).toBeDefined();
    expect(moduleRef.get(UsersService)).toBeDefined();
  });
});
