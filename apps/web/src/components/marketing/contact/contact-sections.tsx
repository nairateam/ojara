import {
  ArrowUpRight,
  Handshake,
  LifeBuoy,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Newspaper,
  Phone,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HELP_TOPICS, SUPPORT } from '@/mock/marketing';
import {
  CONTACT_DESKS,
  CONTACT_HELP_TOPICS,
  CONTACT_OFFICE,
  CONTACT_PHONE,
  SUPPORT_HOURS,
  SUPPORT_OPEN_HOURS,
} from '@/mock/site-contact';
import { DisplayHeading, SITE_GUTTER, SiteEyebrow, SiteHero } from '../site-shell';

/** "+234 800 000 0000" from the wa.me link in `SUPPORT`. */
function whatsappNumber() {
  const digits = SUPPORT.whatsapp.replace(/\D/g, '');
  return digits.startsWith('234')
    ? `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
    : `+${digits}`;
}

const SUPPORT_EMAIL = SUPPORT.email.replace(/^mailto:/, '');

/** Whether WhatsApp support is staffed right now (West Africa Time). */
export function isSupportOnline(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Africa/Lagos',
    }).format(now),
  );
  return hour >= SUPPORT_OPEN_HOURS.from && hour < SUPPORT_OPEN_HOURS.to;
}

/** "Online now" / "Back at 8am" pill. */
function StatusPill({ online }: { online: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold text-forest">
      <span
        aria-hidden
        className={cn('size-2 rounded-full', online ? 'bg-forest' : 'bg-fg-subtle')}
      />
      {online ? 'Online now' : `Back at ${SUPPORT_OPEN_HOURS.from}am`}
    </span>
  );
}

const CHANNELS: {
  icon: LucideIcon;
  value: string;
  detail: string;
  href: string;
  primary?: boolean;
}[] = [
  {
    icon: MessageCircle,
    value: whatsappNumber(),
    detail: 'WhatsApp · Fastest · avg. reply 6 min',
    href: SUPPORT.whatsapp,
    primary: true,
  },
  {
    icon: Mail,
    value: SUPPORT_EMAIL,
    detail: 'Email · Replies within one business day',
    href: SUPPORT.email,
  },
  {
    icon: Phone,
    value: CONTACT_PHONE.display,
    detail: 'Phone · Weekdays, 9am–5pm',
    href: CONTACT_PHONE.href,
  },
];

/**
 * 14 Contact · Hero: "Talk to a human. / Usually in minutes." on the left. The design's "Send us a
 * message" form has no backend yet, so its light card holds the contact channels instead.
 */
export function ContactHero({ online }: { online: boolean }) {
  return (
    <SiteHero>
      <span
        aria-hidden
        className="pointer-events-none absolute top-[62%] left-[22%] -z-10 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/6"
      />
      <div className="flex flex-col gap-10 px-5 pt-14 pb-5 md:px-10 md:pt-16 md:pb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-20 xl:pt-[70px] xl:pr-[64px] xl:pb-16 xl:pl-16">
        <div className="flex flex-col gap-6 md:gap-7">
          <SiteEyebrow tone="light">Contact</SiteEyebrow>
          <DisplayHeading
            as="h1"
            size="lg"
            tone="light"
            line1="Talk to a human."
            line2="Usually in minutes."
            accentClassName="text-paper xl:tracking-[-2px] xl:whitespace-nowrap"
          />
          <p className="max-w-[500px] text-base/[25px] text-paper/80 md:text-lg/[27px]">
            Questions about your store, a payment or a plan? Our team in Lagos is on WhatsApp from
            8am to 8pm, every day.
          </p>
        </div>

        <section
          aria-labelledby="channels-heading"
          className="flex w-full flex-col gap-4 rounded-[28px] bg-surface p-6 text-forest md:p-10 lg:w-[480px] lg:shrink-0 xl:w-[560px]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="channels-heading"
              className="font-display text-[22px] font-semibold tracking-[-0.025em] md:text-[26px]"
            >
              Reach us directly
            </h2>
            <StatusPill online={online} />
          </div>
          <ul className="border-b border-line">
            {CHANNELS.map((c) => (
              <li key={c.href} className="border-t border-line">
                <a href={c.href} className="group flex items-center gap-4 py-[18px]">
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      c.primary ? 'bg-forest text-paper' : 'bg-surface-muted',
                    )}
                  >
                    <c.icon aria-hidden className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="font-display text-lg font-medium tracking-[-0.015em] break-words md:text-xl">
                      {c.value}
                    </span>
                    <span className="text-[13px] text-fg-muted">{c.detail}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-[18px] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SiteHero>
  );
}

const DESK_ICONS = { support: LifeBuoy, partners: Handshake, press: Newspaper } as const;

/** 14 Contact · The right desk: three department cards with their inboxes. */
export function ContactDesks() {
  return (
    <section
      aria-label="The right desk"
      className={cn('flex flex-col gap-10 pt-20 md:gap-11 md:pt-[120px]', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-[18px]">
        <SiteEyebrow>The right desk</SiteEyebrow>
        <DisplayHeading line1="Skip the queue." line2="Go straight to the team." />
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        {CONTACT_DESKS.map((d) => {
          const Icon = DESK_ICONS[d.key];
          const email = d.email ?? SUPPORT_EMAIL;
          return (
            <li
              key={d.key}
              className="flex flex-col justify-between gap-10 rounded-[28px] bg-surface p-7 md:min-h-[300px] md:p-8"
            >
              <div className="flex flex-col gap-[18px]">
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-surface-muted text-forest">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] text-forest">
                  {d.title}
                </h3>
                <p className="text-[15px]/[23px] text-fg-muted">{d.body}</p>
              </div>
              <a
                href={`mailto:${email}`}
                className="flex w-fit items-center gap-2 border-b border-forest pb-1 text-[15px] font-semibold text-forest hover:opacity-75"
              >
                {email}
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 14 Contact · Office card (forest) and support-hours table side by side. */
export function ContactOfficeAndHours({ online }: { online: boolean }) {
  return (
    <section className={cn('grid gap-5 pt-5 lg:grid-cols-2', SITE_GUTTER)}>
      <div className="flex flex-col items-start gap-7 rounded-[28px] bg-forest p-7 md:p-10">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 items-center justify-center rounded-[14px] bg-paper/12 text-paper">
            <MapPin aria-hidden className="size-5" />
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.025em] text-paper">
            {CONTACT_OFFICE.title}
          </h2>
        </div>
        <address className="font-accent text-[30px]/[38px] tracking-[-0.01em] text-paper not-italic md:text-[40px]/[48px]">
          {CONTACT_OFFICE.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <p className="text-[15px]/[23px] text-[#B9BEAD]">{CONTACT_OFFICE.note}</p>
        <a
          href={CONTACT_OFFICE.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="site-btn flex items-center gap-2 rounded-full bg-paper px-5 py-[13px] text-sm font-semibold text-forest hover:opacity-95"
        >
          Get directions
          <Navigation aria-hidden className="size-4" />
        </a>
      </div>

      <div className="flex flex-col gap-5 rounded-[28px] bg-surface-muted p-7 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.025em] text-forest">
            Support hours
          </h2>
          <StatusPill online={online} />
        </div>
        <table className="w-full text-[15px]">
          <caption className="sr-only">Support hours by channel</caption>
          <tbody>
            {SUPPORT_HOURS.map((row, i) => (
              <tr key={row.channel} className={cn(i > 0 && 'border-t border-line')}>
                <th scope="row" className="py-3.5 pr-3 text-left font-medium text-forest">
                  {row.channel}
                </th>
                <td className="py-3.5 pr-3 text-fg-muted sm:w-[150px]">{row.days}</td>
                <td className="py-3.5 text-right text-forest sm:w-[170px]">{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[13px] text-fg-subtle">All times are West Africa Time (WAT).</p>
      </div>
    </section>
  );
}

/** Rounded-down article count, e.g. 71 → "70+". */
const HELP_ANSWERS = `${Math.floor(HELP_TOPICS.reduce((n, t) => n + t.articleCount, 0) / 10) * 10}+`;

/** 14 Contact · Help centre: search (GET /help?q=) and popular-topic chips linking to articles. */
export function ContactHelpCentre() {
  return (
    <section
      aria-label="Help centre"
      className={cn(
        'flex flex-col items-center gap-7 pt-20 text-center md:pt-[120px]',
        SITE_GUTTER,
      )}
    >
      <DisplayHeading
        line1="Rather sort it yourself?"
        line2={`The help centre has ${HELP_ANSWERS} answers.`}
        className="items-center"
      />
      <form action="/help" method="get" role="search" className="w-full max-w-[640px]">
        <label className="flex items-center gap-3 rounded-full bg-surface py-2 pr-2 pl-5 text-forest focus-within:shadow-focus md:pl-[22px]">
          <Search aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
          <span className="sr-only">Search the help centre</span>
          <input
            type="search"
            name="q"
            placeholder="Search the help centre"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-fg-subtle"
          />
          <button
            type="submit"
            className="site-btn rounded-full bg-forest px-4 py-[13px] text-[15px] font-semibold text-paper hover:opacity-95 sm:px-[22px]"
          >
            Search
          </button>
        </label>
      </form>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-fg-muted">Popular:</span>
        {CONTACT_HELP_TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/help/${t.slug}`}
            className="rounded-full border border-line px-3.5 py-2 text-[13px] font-medium text-forest transition-colors hover:bg-forest/5"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
