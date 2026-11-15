import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: Products, variants and categories CRUD. */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}
}
