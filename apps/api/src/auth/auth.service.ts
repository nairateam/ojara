import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { EmailProducer } from '../email/email.producer.js';
import { createAuth, type OjaraAuth } from './auth.factory.js';
import type { AuthSession, AuthUser } from './auth.types.js';

@Injectable()
export class AuthService {
  readonly auth: OjaraAuth;

  constructor(config: AppConfigService, prisma: PrismaService, emails: EmailProducer) {
    // Better Auth only touches global tables (users, sessions, accounts, verifications), so it
    // uses the unscoped client.
    this.auth = createAuth(config.env, prisma.base, emails);
  }

  async getSession(
    headers: IncomingHttpHeaders,
  ): Promise<{ user: AuthUser; session: AuthSession } | null> {
    const result = await this.auth.api.getSession({ headers: fromNodeHeaders(headers) });
    if (!result) return null;
    const { user, session } = result;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' : 'USER',
        twoFactorEnabled: user.twoFactorEnabled === true,
      },
      session: {
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    };
  }
}
