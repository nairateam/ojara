import type { ResolvedTenant } from '@ojara/shared';

interface Entry {
  value: ResolvedTenant | null;
  expiresAt: number;
}

/**
 * Tiny in-memory TTL cache for host -> tenant lookups done in the proxy.
 * Per Next.js server process only; entries disappear on restart and are not shared between
 * instances. Misses (unknown hosts) are cached for a shorter time to blunt host-header probing.
 *
 * TODO(scale): move to Redis (shared across instances) and invalidate on store slug/domain/status
 * changes via an API-published event, instead of relying on TTL expiry.
 */
export class TenantCache {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 5_000,
    private readonly now: () => number = Date.now,
  ) {}

  get(host: string): ResolvedTenant | null | undefined {
    const entry = this.entries.get(host);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(host);
      return undefined;
    }
    return entry.value;
  }

  set(host: string, value: ResolvedTenant | null): void {
    if (this.ttlMs <= 0) return;
    if (this.entries.size >= this.maxEntries) {
      // Map preserves insertion order: drop the oldest entry.
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    const ttl = value ? this.ttlMs : Math.min(this.ttlMs, 10_000);
    this.entries.set(host, { value, expiresAt: this.now() + ttl });
  }

  get size(): number {
    return this.entries.size;
  }
}
