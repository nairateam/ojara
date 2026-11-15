import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { z } from 'zod';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

export const PAYMENTS_QUEUE = 'payments';

export interface PaymentWebhookJob {
  webhookEventId: string;
}

const paystackEventSchema = z.object({
  event: z.string().min(1),
  data: z.looseObject({
    id: z.union([z.number(), z.string()]).optional(),
    reference: z.string().optional(),
  }),
});

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(PAYMENTS_QUEUE) private readonly queue: Queue<PaymentWebhookJob>,
  ) {}

  /**
   * Stores the event first (unique provider+eventId gives idempotency), then enqueues processing.
   * Returns quickly so Paystack gets its 200 within its timeout.
   */
  async recordPaystackEvent(payload: unknown): Promise<{ received: true; duplicate: boolean }> {
    const parsed = paystackEventSchema.safeParse(payload);
    if (!parsed.success) {
      this.logger.warn('Ignoring malformed Paystack webhook payload');
      return { received: true, duplicate: false };
    }
    const { event, data } = parsed.data;
    // Paystack has no top-level event id; event type + transaction id/reference is unique per event.
    const eventId = `${event}:${String(data.id ?? data.reference ?? 'unknown')}`;

    let webhookEventId: string;
    let duplicate = false;
    try {
      // WebhookEvent is a global (non-tenant) table: the event's store is unknown until processed.
      const row = await this.prisma.db.webhookEvent.create({
        data: { provider: 'PAYSTACK', eventId, eventType: event, payload: payload as Prisma.InputJsonValue },
        select: { id: true },
      });
      webhookEventId = row.id;
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) throw err;
      const existing = await this.prisma.db.webhookEvent.findUniqueOrThrow({
        where: { provider_eventId: { provider: 'PAYSTACK', eventId } },
        select: { id: true, processedAt: true },
      });
      if (existing.processedAt) return { received: true, duplicate: true };
      // Stored earlier but maybe never enqueued (e.g. Redis was down): enqueue again. The jobId
      // makes this a no-op if the job already exists.
      webhookEventId = existing.id;
      duplicate = true;
    }

    await this.queue.add(
      event,
      { webhookEventId },
      { jobId: webhookEventId, attempts: 8, backoff: { type: 'exponential', delay: 10_000 } },
    );
    return { received: true, duplicate };
  }
}
