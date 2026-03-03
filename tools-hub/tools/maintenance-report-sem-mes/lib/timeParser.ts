// ============================================================
// TIME PARSER - Converts "0.HH:MM:SS" format to decimal hours
// ============================================================

/**
 * Parse Primavera "Tiempo Total" format into decimal hours.
 * Example: "0.00:55:44" -> 0.9289 hours
 */
export function parseTiempoTotal(raw: string): number {
  if (!raw || !raw.trim()) return 0;
  const match = raw.trim().match(/(?:\d+\.)?(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return 0;
  const [, hh, mm, ss] = match;
  return parseInt(hh) + parseInt(mm) / 60 + parseInt(ss) / 3600;
}

/**
 * Format decimal hours as "Xh YYm" for display.
 */
export function formatHours(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
