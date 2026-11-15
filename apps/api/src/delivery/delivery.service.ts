import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Delivery zones, fees and pickup settings. */
@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}
}
