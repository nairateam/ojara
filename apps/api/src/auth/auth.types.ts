import type { PlatformRole, StoreRole } from '@ojara/shared';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: PlatformRole;
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  createdAt: Date;
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
