// ============================================================
// DATE UTILITIES - Business day calculations (Madrid timezone)
// ============================================================

/**
 * Parse a date string like "1/3/2026 4:08:28" (DD/MM/YYYY HH:MM:SS)
 */
export function parseMadridDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Format: D/M/YYYY H:MM:SS or D/M/YYYY HH:MM:SS
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, min, sec] = match;
  // Create date in UTC, treating as Madrid local time (CET = UTC+1 or CEST = UTC+2)
  // For business logic, we only care about the date part
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(min),
    parseInt(sec)
  );
}

/**
 * Count business days between two dates (Monday-Friday), exclusive of weekends
 */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current < endDate) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // 0 = Sunday, 6 = Saturday
  }
  return count;
}

/**
 * Returns the previous business date (skips Sunday -> Friday, Monday -> Friday)
 * If today is Monday, returns Friday. Otherwise returns yesterday.
 */
export function getPreviousBusinessDay(from: Date = new Date()): Date {
  const prev = new Date(from);
  do {
    prev.setDate(prev.getDate() - 1);
  } while (prev.getDay() === 0 || prev.getDay() === 6);
  return prev;
}

/**
 * Returns true if the given date falls on the same calendar day as ref
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format a Date as a readable dd/mm/yyyy string
 */
export function formatDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}
