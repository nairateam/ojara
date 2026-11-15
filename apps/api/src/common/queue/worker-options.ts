import type { NestWorkerOptions } from '@nestjs/bullmq';

/**
 * Shared BullMQ worker settings, tuned for Redis providers that bill per command (e.g. Upstash).
 * - drainDelay: an idle worker waits up to 5 minutes in one blocking call; new jobs still wake it
 *   immediately, so latency is unaffected. (Default 5 s ≈ 12 polls/minute per worker.)
 * - stalledInterval: check for jobs abandoned by a crashed worker every 5 minutes (default 30 s).
 *   Trade-off: a job whose worker died mid-run is retried after up to ~5 minutes.
 */
export const WORKER_OPTIONS: NestWorkerOptions = {
  drainDelay: 300,
  stalledInterval: 300_000,
};
