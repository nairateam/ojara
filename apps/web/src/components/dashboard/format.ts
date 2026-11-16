/** Compact naira for chart ticks and mobile KPIs: ₦1.28M, ₦464k, ₦9,500. */
export function formatCompactKobo(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${trim(naira / 1_000_000, 2)}M`;
  if (naira >= 10_000) return `₦${Math.round(naira / 1000)}k`;
  return `₦${naira.toLocaleString('en-NG')}`;
}

function trim(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\.?0+$/, '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Merchants and the platform run on Lagos time (WAT), whatever the server's time zone. */
const LAGOS = 'Africa/Lagos';

/** "Good morning" / "Good afternoon" / "Good evening" for the given moment, in Lagos time. */
export function timeOfDayGreeting(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: LAGOS }).format(
      now,
    ),
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "Saturday, 15 November" in Lagos time. */
export function todayLabel(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: LAGOS,
  }).format(now);
}

/** "16 Nov, 2:14 pm" in Lagos time. */
export function formatOrderTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: LAGOS,
  }).format(new Date(iso));
}

/** "Today" / "Earlier" bucket for an order list, by the Lagos calendar day. */
export function isTodayInLagos(iso: string, now: Date = new Date()): boolean {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: LAGOS });
  return day.format(new Date(iso)) === day.format(now);
}
