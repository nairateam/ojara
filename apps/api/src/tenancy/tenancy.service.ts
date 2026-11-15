import { Injectable, NotFoundException } from '@nestjs/common';
import { classifyHost, type ResolvedTenant } from '@ojara/shared';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { TenantContext } from './tenant-context.js';

const tenantSelect = {
  id: true,
  slug: true,
  name: true,
  status: true,
  currency: true,
  primaryColor: true,
  logoPublicId: true,
} as const;

@Injectable()
export class TenancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  /**
   * Maps a storefront host to its store. `{slug}.ROOT_DOMAIN` resolves by slug; any other host must
   * be a VERIFIED/ACTIVE custom domain. Platform hosts (app., admin., api., root) are not tenants.
   * Archived stores never resolve. Status (DRAFT/DISABLED/SUSPENDED) is returned so the web app can
   * show the right page.
   */
  async resolveHost(host: string): Promise<ResolvedTenant> {
    const classification = classifyHost(host, this.config.env.ROOT_DOMAIN);

    const store = await TenantContext.runAsSystem('tenant-resolve', async () => {
      if (classification.kind === 'store-subdomain') {
        return this.prisma.db.store.findFirst({
          where: { slug: classification.slug, archivedAt: null },
          select: tenantSelect,
        });
      }
      if (classification.kind === 'custom-domain') {
        const domain = await this.prisma.db.domain.findFirst({
          where: { hostname: classification.hostname, status: { in: ['VERIFIED', 'ACTIVE'] } },
          select: { store: { select: { ...tenantSelect, archivedAt: true } } },
        });
        return domain && !domain.store.archivedAt ? domain.store : null;
      }
      return null;
    });

    if (!store) throw new NotFoundException('No store for this host');
    return {
      storeId: store.id,
      slug: store.slug,
      name: store.name,
      status: store.status,
      currency: store.currency,
      primaryColor: store.primaryColor,
      logoPublicId: store.logoPublicId,
      hostname:
        classification.kind === 'custom-domain'
          ? classification.hostname
          : `${store.slug}.${this.config.env.ROOT_DOMAIN}`,
    };
  }
}
