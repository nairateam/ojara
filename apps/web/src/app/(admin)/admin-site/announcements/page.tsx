import { ArrowRight, CalendarCheck, CalendarClock, Check, Megaphone } from 'lucide-react';
import type { Metadata } from 'next';
import { AdminCard, AdminCardTitle } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { SectionLabel } from '@/components/ui/panels';
import { ANNOUNCEMENT_DRAFT as D, RECENT_ANNOUNCEMENTS } from '@/mock/admin';

export const metadata: Metadata = { title: 'Announcements' };

/** 06.08 Announcements — composer with audience + channels, dashboard preview, recent sends. */
export default function AnnouncementsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        subtitle="Messages to merchants in the dashboard, by email or SMS."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminCard className="gap-0 px-[22px]">
          <AdminCardTitle className="mb-3.5">New announcement</AdminCardTitle>
          <form className="flex flex-col gap-5">
            <Field label="Title" htmlFor="ann-title">
              <Input id="ann-title" defaultValue={D.title} />
            </Field>
            <Field label="Message" htmlFor="ann-message">
              <Textarea id="ann-message" defaultValue={D.message} className="min-h-[84px]" />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-ui font-semibold text-fg">Who gets it</legend>
              <div className="flex flex-wrap gap-2">
                {D.audiences.map((a) => (
                  <label
                    key={a.label}
                    className="group flex cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted has-checked:border-fg-muted has-checked:bg-surface-muted has-checked:text-fg has-focus-visible:shadow-focus"
                  >
                    <input
                      type="checkbox"
                      name="audience"
                      value={a.label}
                      defaultChecked={a.selected}
                      className="peer sr-only"
                    />
                    <Check className="hidden size-3.5 peer-checked:block" aria-hidden />
                    {a.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-fg-muted">{D.reach}</p>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-ui font-semibold text-fg">Channels</legend>
              <div className="flex flex-wrap gap-5">
                {D.channels.map((c) => (
                  <label key={c.label} className="flex cursor-pointer items-center gap-2 text-ui">
                    <Checkbox size={18} defaultChecked={c.checked} name="channel" value={c.label} />
                    {c.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-fg-subtle">{D.smsNote}</p>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
              <span className="flex items-center gap-2 text-ui font-medium text-fg">
                <CalendarClock className="size-4 text-fg-muted" aria-hidden />
                {D.sendAt}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="secondary">
                  Save draft
                </Button>
                <Button type="button">
                  <CalendarCheck /> Schedule
                </Button>
              </div>
            </div>
          </form>
        </AdminCard>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <SectionLabel>Preview · Merchant dashboard</SectionLabel>
            <div className="flex gap-3 rounded-lg bg-forest p-4 text-paper">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-paper/10">
                <Megaphone className="size-4" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{D.preview.title}</span>
                <span className="text-xs text-fg-on-dark">{D.preview.body}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold">
                  {D.preview.cta} <ArrowRight className="size-3" aria-hidden />
                </span>
              </div>
            </div>
          </div>
          <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
            <div className="px-[18px] py-4">
              <AdminCardTitle>Recent</AdminCardTitle>
            </div>
            <ul>
              {RECENT_ANNOUNCEMENTS.map((a) => (
                <li
                  key={a.title}
                  className="flex items-center gap-2.5 border-t border-line px-[18px] py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-ui font-semibold text-fg">{a.title}</span>
                    <span className="text-xs text-fg-muted">{a.meta}</span>
                  </span>
                  <StatusPill tone={a.status === 'Sent' ? 'success' : 'neutral'}>
                    {a.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
