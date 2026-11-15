import { Monitor, Smartphone, Upload } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SplitPage } from '@/components/app/page-container';
import { StorefrontEditorPanel } from '@/components/dashboard-store/storefront-editor-panel';
import { StorefrontPreview } from '@/components/dashboard-store/storefront-preview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Storefront' };

const DEVICES = [
  { key: 'desktop', label: 'Desktop', icon: Monitor, href: '/storefront' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, href: '/storefront?device=mobile' },
] as const;

type Props = { searchParams: Promise<{ device?: string }> };

/** 03.10 Storefront editor: settings panel on the left, browser-framed preview on the right. */
export default async function StorefrontEditorPage({ searchParams }: Props) {
  const device = (await searchParams).device === 'mobile' ? 'mobile' : 'desktop';
  return (
    <SplitPage panelSide="left" panel={<StorefrontEditorPanel />} className="flex-col lg:flex-row">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Preview device"
          className="flex gap-0.5 rounded-md bg-surface-muted p-[3px]"
        >
          {DEVICES.map(({ key, label, icon: Icon, href }) => {
            const active = key === device;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-2.5 py-[5px] text-xs',
                  active
                    ? 'bg-surface font-semibold text-fg shadow-segment'
                    : 'font-medium text-fg-muted hover:text-fg',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span aria-hidden className="size-[7px] rounded-full bg-fg-muted" />1 unpublished change
          </span>
          <Button variant="secondary">Discard</Button>
          <Button>
            <Upload /> Publish changes
          </Button>
        </div>
      </div>
      <StorefrontPreview device={device} />
    </SplitPage>
  );
}
