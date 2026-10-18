/**
 * Format a `YYYY-MM-DD` calendar date for display.
 *
 * The API stores dates without a time zone, so it is parsed and formatted in
 * UTC to avoid the day shifting backwards in negative-offset time zones.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
