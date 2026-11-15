import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** SHELL: User profile & account management (name, avatar, password change). */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
}
