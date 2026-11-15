import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CLIENT_IP_HEADER } from '../../auth/auth.factory.js';

/**
 * Rate-limits by the client IP that bootstrap.ts resolved into CLIENT_IP_HEADER (the same value
 * Better Auth uses), so requests the web server makes on a browser's behalf count against that
 * browser rather than one shared bucket for the web server.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req.headers as Record<string, string | string[] | undefined> | undefined;
    const ip = headers?.[CLIENT_IP_HEADER];
    const fallback = typeof req.ip === 'string' ? req.ip : 'unknown';
    return Promise.resolve(typeof ip === 'string' && ip ? ip : fallback);
  }
}
