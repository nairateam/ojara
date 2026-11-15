import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Order lifecycle (separate payment and fulfilment statuses). */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
}
