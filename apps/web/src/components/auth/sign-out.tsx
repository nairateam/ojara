'use client';

import { ChevronDown, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DropdownMenu } from 'radix-ui';
import { type ReactNode, useState } from 'react';
import { signOut } from '@/lib/api/browser';
import { cn } from '@/lib/utils';

/**
 * Signs out, then goes to /login and refreshes so no signed-in view lingers in the client router
 * cache. If the API call fails the cookie may still be valid, so we stay put.
 */
function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function run() {
    setPending(true);
    try {
      await signOut();
      router.replace('/login');
      router.refresh();
    } catch {
      setPending(false);
    }
  }
  return { pending, run };
}

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { pending, run } = useSignOut();
  return (
    <button type="button" className={className} disabled={pending} onClick={() => void run()}>
      {children ?? (
        <>
          <LogOut className="size-4" aria-hidden /> {pending ? 'Logging out…' : 'Log out'}
        </>
      )}
    </button>
  );
}

const itemClass =
  'flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-ui outline-none select-none data-[highlighted]:bg-surface-muted data-[disabled]:opacity-50';

/** Top bar account block (avatar, name, role) opening a small menu with settings and log out. */
export function AccountMenu({
  name,
  role,
  initials,
  settingsHref,
}: {
  name: string;
  role: string;
  initials: string;
  settingsHref?: string | undefined;
}) {
  const { pending, run } = useSignOut();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center gap-2.5 rounded-md p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-fg/20"
        aria-label={`Account: ${name}`}
      >
        <span className="flex size-[34px] items-center justify-center rounded-full bg-surface-muted text-ui font-semibold">
          {initials}
        </span>
        <span className="hidden flex-col leading-tight md:flex">
          <span className="text-ui font-semibold">{name}</span>
          <span className="text-xs text-fg-muted">{role}</span>
        </span>
        <ChevronDown className="hidden size-4 text-fg-muted md:block" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 min-w-[200px] rounded-md border border-line bg-surface p-1.5 shadow-lg',
          )}
        >
          {settingsHref ? (
            <DropdownMenu.Item asChild className={itemClass}>
              <Link href={settingsHref}>
                <Settings className="size-4 text-fg-muted" aria-hidden /> Settings
              </Link>
            </DropdownMenu.Item>
          ) : null}
          <DropdownMenu.Item
            className={itemClass}
            disabled={pending}
            onSelect={(event) => {
              event.preventDefault();
              void run();
            }}
          >
            <LogOut className="size-4 text-fg-muted" aria-hidden />
            {pending ? 'Logging out…' : 'Log out'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
