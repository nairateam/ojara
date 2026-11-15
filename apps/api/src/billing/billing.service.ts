import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Plans and subscriptions (Paystack subscriptions). */
@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}
}
