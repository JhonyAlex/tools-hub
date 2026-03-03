// ============================================================
// DATE UTILITIES - Period ranges and date parsing
// ============================================================

/**
 * Parse Madrid-timezone date string (D/M/YYYY H:MM:SS).
 */
export function parseMadridDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/
  );
  if (!match) return null;
  const [, day, month, year, hour, min, sec] = match;
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
 * Get previous week range (Mon 00:00:00 to Sun 23:59:59).
 */
export function getPreviousWeekRange(
  from: Date = new Date()
): { start: Date; end: Date } {
  const d = new Date(from);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon...
  const daysToThisMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(d);
  thisMonday.setDate(d.getDate() - daysToThisMonday);

  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(thisMonday.getDate() - 7);
  prevMonday.setHours(0, 0, 0, 0);

  const prevSunday = new Date(prevMonday);
  prevSunday.setDate(prevMonday.getDate() + 6);
  prevSunday.setHours(23, 59, 59, 999);

  return { start: prevMonday, end: prevSunday };
}

/**
 * Get previous month range (1st 00:00:00 to last day 23:59:59).
 */
export function getPreviousMonthRange(
  from: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(from.getFullYear(), from.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(from.getFullYear(), from.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Check if a date falls within a range (inclusive).
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function formatDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}
