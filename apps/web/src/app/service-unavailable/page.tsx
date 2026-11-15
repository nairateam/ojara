import { CloudOff } from 'lucide-react';
import type { Metadata } from 'next';
import { SystemMessage } from '@/components/system/system-message';

export const metadata: Metadata = { title: 'Temporarily unavailable' };
export const dynamic = 'force-dynamic';

/** Shown by the proxy when the API can't resolve a store host. Not in the designs. */
export default function ServiceUnavailable() {
  return (
    <SystemMessage
      icon={CloudOff}
      title="This store is taking a moment"
      body={<p>We couldn&apos;t load this store just now. Please refresh in a minute.</p>}
    />
  );
}
