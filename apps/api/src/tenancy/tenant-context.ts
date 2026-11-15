import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextState {
  /** Store the current request/job is scoped to. */
  storeId?: string;
  /** Explicit opt-out of tenant scoping (platform admin, system jobs). Never set from user input. */
  bypass?: boolean;
  /** Who is acting, for audit logging. */
  actorId?: string;
  /** Why the bypass was granted, for logs. */
  bypassReason?: string;
}

export class TenantContextMissingError extends Error {
  constructor(model: string, operation: string) {
    super(
      `Refusing ${model}.${operation}: no tenant context. Run inside TenantContext.runForStore() ` +
        `or, for platform-level work, TenantContext.runAsSystem().`,
    );
    this.name = 'TenantContextMissingError';
  }
}

const storage = new AsyncLocalStorage<TenantContextState>();

/**
 * Per-request / per-job tenant scope backed by AsyncLocalStorage.
 *
 * - HTTP: TenantContextMiddleware opens an empty, mutable scope for every request. StoreAccessGuard
 *   fills in `storeId` once it has confirmed membership.
 * - Jobs/scripts: wrap work in `runForStore()` or `runAsSystem()`.
 */
export const TenantContext = {
  get(): TenantContextState | undefined {
    return storage.getStore();
  },

  /** Opens a fresh mutable scope (used by the HTTP middleware). */
  run<T>(fn: () => T, initial: TenantContextState = {}): T {
    return storage.run({ ...initial }, fn);
  },

  /**
   * Runs `fn` scoped to a store. `fn` is awaited *inside* the scope: Prisma queries are lazy
   * (they execute on `.then()`), so returning an un-awaited query from a plain callback would run
   * it after the scope has closed.
   */
  async runForStore<T>(storeId: string, fn: () => T | PromiseLike<T>, actorId?: string): Promise<T> {
    return storage.run({ storeId, ...(actorId ? { actorId } : {}) }, async () => await fn());
  },

  /** Explicit opt-out helper for platform admin and system jobs. Use sparingly and say why. */
  async runAsSystem<T>(reason: string, fn: () => T | PromiseLike<T>): Promise<T> {
    return storage.run({ bypass: true, bypassReason: reason }, async () => await fn());
  },

  /** Scopes the current (already open) request context to a store. */
  setStore(storeId: string, actorId?: string): void {
    const state = storage.getStore();
    if (!state) throw new Error('TenantContext.setStore called outside a tenant scope');
    if (state.storeId && state.storeId !== storeId) {
      throw new Error('Tenant context is already bound to a different store');
    }
    state.storeId = storeId;
    if (actorId) state.actorId = actorId;
  },
};
