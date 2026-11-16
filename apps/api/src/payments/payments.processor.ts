import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { z } from 'zod';
import { PaymentConfirmationService } from '../checkout/payment-confirmation.service.js';
import { WORKER_OPTIONS } from '../common/queue/worker-options.js';
import { PrismaService } from '../database/prisma.service.js';
import { PAYMENTS_QUEUE, type PaymentWebhookJob } from './payments.service.js';

const chargeSchema = z.object({
  event: z.string(),
  data: z.looseObject({
    reference: z.string(),
    status: z.string(),
    amount: z.number().int(),
    currency: z.string(),
    paid_at: z.string().nullish(),
  }),
});

/**
 * Processes stored Paystack webhooks. THE WEBHOOK, NOT THE BROWSER REDIRECT, IS THE SOURCE OF
 * TRUTH FOR PAYMENT STATUS. Each event is processed once (WebhookEvent.processedAt).
 */
@Processor(PAYMENTS_QUEUE, WORKER_OPTIONS)
export class PaymentsProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly confirmation: PaymentConfirmationService,
  ) {
    super();
  }

  async process(job: Job<PaymentWebhookJob>): Promise<void> {
    const event = await this.prisma.db.webhookEvent.findUnique({
      where: { id: job.data.webhookEventId },
    });
    if (!event || event.processedAt) return;

    if (event.eventType === 'charge.success') {
      const parsed = chargeSchema.safeParse(event.payload);
      if (!parsed.success) {
        this.logger.warn(`Malformed charge.success payload (${event.eventId})`);
      } else {
        const d = parsed.data.data;
        const outcome = await this.confirmation.confirm(d.reference, {
          status: d.status === 'success' ? 'success' : 'pending',
          amountKobo: d.amount,
          currency: d.currency,
          paidAt: d.paid_at ?? null,
          raw: event.payload,
        });
        this.logger.log(`charge.success ${d.reference}: ${outcome}`);
      }
    } else {
      // Refunds and subscription events arrive with those features.
      this.logger.log(`Paystack ${event.eventType} (${event.eventId}) recorded; not handled yet`);
    }

    await this.prisma.db.webhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), error: null },
    });
  }
}
