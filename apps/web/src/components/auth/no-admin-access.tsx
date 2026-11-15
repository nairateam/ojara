import { ShieldAlert } from 'lucide-react';
import { SystemMessage } from '@/components/system/system-message';
import { SignOutButton } from './sign-out';

/** Signed in, but not a platform admin: shown instead of the admin console. */
export function NoAdminAccess() {
  return (
    <SystemMessage
      icon={ShieldAlert}
      title="No admin access"
      body="This account isn’t a platform admin. Log out and sign in with an admin account."
      action={
        <SignOutButton className="inline-flex h-10 items-center gap-2 rounded-md bg-forest px-4 text-ui font-semibold text-paper hover:bg-forest/90 disabled:opacity-60" />
      }
    />
  );
}
