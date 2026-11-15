import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service.js';
import { PAYMENTS_QUEUE, type PaymentWebhookJob } from './payments.service.js';

@Processor(PAYMENTS_QUEUE)
export class PaymentsProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<PaymentWebhookJob>): Promise<void> {
    const event = await this.prisma.db.webhookEvent.findUnique({
      where: { id: job.data.webhookEventId },
    });
    if (!event || event.processedAt) return;

    // TODO(checkout): THE WEBHOOK, NOT THE BROWSER REDIRECT, IS THE SOURCE OF TRUTH FOR PAYMENT STATUS.
    //  1. Look up Payment by data.reference (TenantContext.runAsSystem, then runForStore(payment.storeId)).
    //  2. Re-verify amount + currency against the Payment row (never trust the payload amount alone).
    //  3. charge.success -> Payment PAID + Order.paymentStatus PAID (in one tenantTransaction),
    //     enqueue order-confirmation email; charge.failed -> FAILED; refund.processed -> REFUNDED.
    //  4. Subscription events (subscription.create / invoice.payment_failed) -> billing module.
    this.logger.log(
      `Received Paystack ${event.eventType} (${event.eventId}); processing not implemented yet`,
    );

    await this.prisma.db.webhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date() },
    });
  }
}
