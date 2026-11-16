import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentConfirmationService } from '../checkout/payment-confirmation.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { TenantContext } from '../tenancy/tenant-context.js';

/** Payments still pending after this long are re-checked with Paystack. */
const STALE_AFTER_MS = 10 * 60 * 1000;
/** Abandoned checkouts older than this are left alone. */
const GIVE_UP_AFTER_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Finds payments whose webhook never arrived and asks Paystack what happened, feeding the answer
 * through the same confirmation code as the webhook.
 * TODO(scale): guard with a distributed lock once the API runs on several instances.
 */
@Injectable()
export class PaymentsReconcileJob {
  private readonly logger = new Logger(PaymentsReconcileJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly confirmation: PaymentConfirmationService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'payments-reconcile' })
  async reconcilePendingPayments(): Promise<void> {
    const now = Date.now();
    const stale = await TenantContext.runAsSystem('payments-reconcile', () =>
      this.prisma.db.payment.findMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: new Date(now - STALE_AFTER_MS), gt: new Date(now - GIVE_UP_AFTER_MS) },
        },
        select: { reference: true },
        take: 50,
        orderBy: { createdAt: 'asc' },
      }),
    );
    for (const p of stale) {
      const outcome = await this.confirmation.reconcile(p.reference);
      if (outcome !== 'pending') this.logger.log(`Reconciled ${p.reference}: ${outcome}`);
    }
  }
}
