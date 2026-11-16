import { Injectable } from '@nestjs/common';
import type {
  DeliverySettingsDto,
  DeliverySettingsInput,
  StorefrontDeliveryDto,
} from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;

const settingsSelect = {
  deliveryEnabled: true,
  freeDeliveryOverKobo: true,
  pickupEnabled: true,
  pickupAddress: true,
  pickupHours: true,
  orderReadyIn: true,
  sameDayCutoff: true,
  orderConfirmationNote: true,
} as const satisfies Prisma.StoreSelect;

const zoneSelect = {
  id: true,
  name: true,
  areas: true,
  feeKobo: true,
  eta: true,
  isActive: true,
} as const satisfies Prisma.DeliveryZoneSelect;

type ZoneRow = Prisma.DeliveryZoneGetPayload<{ select: typeof zoneSelect }>;
const toZone = (z: ZoneRow) => ({ ...z, areas: z.areas as string[] });

/**
 * Delivery zones, pickup and order-handling notes for a store (03.11, onboarding 02.08). Runs in
 * the store's tenant context. Removed zones are archived, not deleted, so past orders keep their
 * zone.
 */
@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  private async read(tx: Tx, storeId: string): Promise<DeliverySettingsDto> {
    const store = await tx.store.findUniqueOrThrow({
      where: { id: storeId },
      select: settingsSelect,
    });
    const zones = await tx.deliveryZone.findMany({
      where: { storeId, archivedAt: null },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: zoneSelect,
    });
    return { ...store, zones: zones.map(toZone) };
  }

  get(storeId: string): Promise<DeliverySettingsDto> {
    return this.prisma.tenantTransaction((tx) => this.read(tx, storeId));
  }

  /** Replaces the whole setup: settings, then zones (matched by id; missing ones archived). */
  update(
    storeId: string,
    actorId: string,
    input: DeliverySettingsInput,
  ): Promise<DeliverySettingsDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const { zones, ...settings } = input;
      await tx.store.update({ where: { id: storeId }, data: settings });

      const existing = await tx.deliveryZone.findMany({
        where: { storeId, archivedAt: null },
        select: { id: true },
      });
      const known = new Set(existing.map((z) => z.id));
      const kept = new Set<string>();
      for (const [position, z] of zones.entries()) {
        const data = {
          name: z.name,
          areas: z.areas,
          feeKobo: z.feeKobo,
          eta: z.eta,
          isActive: z.isActive,
          position,
        };
        if (z.id && known.has(z.id)) {
          kept.add(z.id);
          await tx.deliveryZone.update({ where: { id: z.id }, data });
        } else {
          await tx.deliveryZone.create({ data: { storeId, ...data } });
        }
      }
      const removed = [...known].filter((id) => !kept.has(id));
      if (removed.length) {
        await tx.deliveryZone.updateMany({
          where: { storeId, id: { in: removed } },
          data: { archivedAt: new Date(), isActive: false },
        });
      }
      await tx.auditLog.create({
        data: {
          storeId,
          actorId,
          action: 'delivery.updated',
          entity: 'Store',
          entityId: storeId,
          metadata: { zones: zones.length, removed: removed.length },
        },
      });
      return this.read(tx, storeId);
    });
  }

  /** Shopper view: active zones only, and pickup when it's on. */
  async forStorefront(tx: Tx, storeId: string): Promise<StorefrontDeliveryDto> {
    const s = await this.read(tx, storeId);
    return {
      zones: s.deliveryEnabled
        ? s.zones.filter((z) => z.isActive).map(({ isActive: _a, ...z }) => z)
        : [],
      freeDeliveryOverKobo: s.deliveryEnabled ? s.freeDeliveryOverKobo : null,
      pickup:
        s.pickupEnabled && s.pickupAddress
          ? { address: s.pickupAddress, hours: s.pickupHours }
          : null,
      orderReadyIn: s.orderReadyIn,
    };
  }
}
