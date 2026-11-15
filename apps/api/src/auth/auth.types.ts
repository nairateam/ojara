import type { PlatformRole, StoreRole } from '@ojara/shared';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: PlatformRole;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface StoreMembership {
  storeId: string;
  role: StoreRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session?: AuthSession;
  storeMembership?: StoreMembership;
}
