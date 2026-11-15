import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Platform admin console (merchants, plans, abuse reports, audit log). */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
}
