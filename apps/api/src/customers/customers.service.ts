import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Per-store customer records (customers have no accounts). */
@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
}
