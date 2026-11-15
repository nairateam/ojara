import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Custom domain connection and DNS verification. */
@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}
}
