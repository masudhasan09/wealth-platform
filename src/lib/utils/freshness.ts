/**
 * Freshness utility — compute human-readable labels and stale flags
 * based on how old a price quote is.
 */

/** Stale thresholds in milliseconds by source category. */
const STALE_MS = {
  market: 15 * 60 * 1000,       // 15 minutes for live quotes
  crypto: 5 * 60 * 1000,        // 5 minutes for crypto
  manual: Infinity,              // manual prices never expire automatically
  daily: 24 * 60 * 60 * 1000,   // 24 hours for fixed income / RE
} as const;

/** Returns true when the quote age exceeds its threshold. */
export function isStale(asOf: Date, category: keyof typeof STALE_MS = 'market'): boolean {
  const ageMs = Date.now() - asOf.getTime();
  return ageMs > STALE_MS[category];
}

/** Returns a human-readable freshness string, e.g. "2 min ago", "3 days old". */
export function getFreshnessLabel(asOf: Date): string {
  const ageMs = Date.now() - asOf.getTime();
  const ageSec = Math.floor(ageMs / 1000);
  const ageMin = Math.floor(ageSec / 60);
  const ageHour = Math.floor(ageMin / 60);
  const ageDay = Math.floor(ageHour / 24);

  if (ageSec < 60) return 'Just now';
  if (ageMin < 60) return `${ageMin} min ago`;
  if (ageHour < 24) return `${ageHour}h ago`;
  if (ageDay === 1) return '1 day old';
  return `${ageDay} days old`;
}

/**
 * Badge variant used by the FreshnessBadge atom.
 * - live:    quote age < 15 min
 * - delayed: quote age 15 min – 24 h
 * - manual:  sourced from manual entry
 * - stale:   quote age > 24 h (or >7 days → 'very-stale')
 */
export type FreshnessVariant = 'live' | 'delayed' | 'manual' | 'stale' | 'very-stale';

export function getFreshnessVariant(
  asOf: Date,
  source: string,
): FreshnessVariant {
  if (source === 'manual' || source === 'import') return 'manual';
  const ageMs = Date.now() - asOf.getTime();
  const ageDay = ageMs / (24 * 60 * 60 * 1000);
  if (ageMs < STALE_MS.market) return 'live';
  if (ageDay < 1) return 'delayed';
  if (ageDay >= 7) return 'very-stale';
  return 'stale';
}
