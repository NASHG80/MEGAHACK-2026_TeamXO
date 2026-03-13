/**
 * Date utility helpers used across hackathon components.
 */

/**
 * Format a date string/value into a readable short date.
 * e.g. "2026-03-25" → "Mar 25, 2026"
 */
export function fmt(dateVal) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns the number of full days until a given date,
 * or null if the date is invalid.
 */
export function daysUntil(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d)) return null;
  const now = new Date();
  const diff = Math.ceil((d.setHours(23, 59, 59, 999) - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

/**
 * Returns true if the given date is in the future (deadline not yet passed).
 */
export function isFuture(dateVal) {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (isNaN(d)) return false;
  d.setHours(23, 59, 59, 999);
  return d.getTime() > Date.now();
}
