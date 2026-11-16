import type { StoreDto } from '@ojara/shared';
import type { PreviewStore } from '@/components/onboarding/phone-preview';
import { clientEnv } from '@/env';

/** "+2348035550144" -> "+234 803 555 0144" (other values unchanged). */
export function formatNigerianPhone(e164: string): string {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : e164;
}

/** Store web address as shown to merchants, e.g. "adunni.ojara.localhost". */
export function storeHost(slug: string): string {
  return `${slug}.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`;
}

/** The merchant's store for the onboarding phone preview; undefined shows the sample store. */
export function previewStore(
  store: Pick<StoreDto, 'name' | 'slug' | 'whatsappNumber' | 'primaryColor'> | null,
): PreviewStore | undefined {
  if (!store) return undefined;
  return {
    name: store.name,
    host: storeHost(store.slug),
    whatsapp: store.whatsappNumber ? formatNigerianPhone(store.whatsappNumber) : null,
    primaryColor: store.primaryColor,
  };
}

/** Props for <PhonePreview>: the merchant's store when there is one, else the sample store. */
export function withStore(
  store: Parameters<typeof previewStore>[0],
): { store: PreviewStore } | Record<string, never> {
  const preview = previewStore(store);
  return preview ? { store: preview } : {};
}
