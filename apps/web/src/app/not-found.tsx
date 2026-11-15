import { Store } from 'lucide-react';
import type { Metadata } from 'next';
import { SystemMessage } from '@/components/system/system-message';
import { Button } from '@/components/ui/button';
import { platformOrigin } from '@/lib/platform-url';

export const metadata: Metadata = { title: 'Not found' };

/** Friendly 404 for unknown store hosts and unknown paths on any host. */
export default async function NotFound() {
  const home = await platformOrigin('marketing');
  return (
    <SystemMessage
      icon={Store}
      title="We couldn't find that store"
      body={
        <p>
          The address may be mistyped, or the store may have moved or closed. Check the link the
          seller shared with you, or start your own store on Ojara.
        </p>
      }
      action={
        <Button asChild>
          <a href={home}>Go to Ojara</a>
        </Button>
      }
    />
  );
}
