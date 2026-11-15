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
