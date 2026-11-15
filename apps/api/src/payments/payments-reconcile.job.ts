import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * PLACEHOLDER scheduled job. Will find Payments stuck in PENDING (e.g. webhook never arrived) and
 * re-check them with PaystackClient.verifyTransaction, then feed the result through the same
 * code path as the webhook processor.
 * TODO(checkout): implement; guard with a distributed lock once the API runs on several instances.
 */
@Injectable()
export class PaymentsReconcileJob {
  private readonly logger = new Logger(PaymentsReconcileJob.name);

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'payments-reconcile' })
  reconcilePendingPayments(): void {
    this.logger.debug('payments-reconcile: not implemented yet');
  }
}
