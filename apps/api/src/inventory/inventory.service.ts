import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Stock levels, adjustments and low-stock alerts. */
@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}
}
