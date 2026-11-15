import { Check, Moon, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import { LockedInput, SettingsSection } from '@/components/dashboard-store/settings-ui';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { STORE } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Settings · Store details' };

const CATEGORIES = [
  'Fashion & clothing',
  'Beauty & personal care',
  'Food & drinks',
  'Home & living',
  'Arts & crafts',
  'Electronics',
  'Other',
];

/** 03.15 Settings – Store details. */
export default function StoreDetailsPage() {
  return (
    <form className="flex flex-col gap-[22px]">
      <SettingsSection
        title="Business"
        description="How your business appears on your store, receipts and in Ojara."
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Business name" htmlFor="business-name">
            <Input id="business-name" name="name" defaultValue={STORE.name} />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" name="category" defaultValue={STORE.category}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Short description" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            defaultValue={STORE.description}
            className="min-h-14"
            rows={2}
          />
        </Field>
      </SettingsSection>

      <SettingsSection
        title="Contact"
        description="Customers use these to reach you. Your WhatsApp number shows on every page."
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="WhatsApp number" htmlFor="whatsapp">
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              prefix="+234"
              defaultValue={STORE.whatsapp}
            />
          </Field>
          <Field label="Support email" htmlFor="support-email">
            <Input
              id="support-email"
              name="supportEmail"
              type="email"
              defaultValue={STORE.supportEmail}
            />
          </Field>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-[1fr_220px]">
          <Field label="Studio address" htmlFor="address">
            <Input id="address" name="address" defaultValue={STORE.address} />
          </Field>
          <Field label="Instagram" htmlFor="instagram">
            <Input id="instagram" name="instagram" prefix="@" defaultValue={STORE.instagram} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Region"
        description="Set when you signed up. Contact support to change."
      >
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Field label="Country">
            <LockedInput value="Nigeria" />
          </Field>
          <Field label="Currency">
            <LockedInput value="Nigerian naira (₦)" />
          </Field>
          <Field label="Time zone">
            <LockedInput value="West Africa Time (WAT)" />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Close or delete store"
        description="Closing hides your store until you reopen it. Deleting is permanent."
        tone="danger"
        className="border-b-0 pb-0"
        cardClassName="gap-3 md:flex-row md:items-center"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-ui font-semibold text-fg">Temporarily close your store</p>
          <p className="text-xs text-fg-muted">
            Good for holidays. Customers see a “back soon” page; orders already placed stay active.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary">
            <Moon /> Close store
          </Button>
          <Button type="button" variant="destructive">
            <Trash2 /> Delete store
          </Button>
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-2.5">
        <Button type="reset" variant="secondary">
          Cancel
        </Button>
        <Button type="button">
          <Check /> Save changes
        </Button>
      </div>
    </form>
  );
}
