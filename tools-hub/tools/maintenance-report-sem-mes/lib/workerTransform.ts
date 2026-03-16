// ============================================================
// WORKER NAME TRANSFORM - Business rules for worker names
// ============================================================

/**
 * Transform worker names:
 * - If any observation field contains "paco" (any case/position/punctuation), assign "Francisco Moral"
 * - Otherwise keep original worker name
 */
export function transformWorkerName(
  trabajador: string,
  ...observationFields: Array<string | undefined>
): string {
  const name = trabajador.trim();

  const hasPacoAlias = observationFields.some((value) => {
    if (!value) return false;
    // Match "paco" as a standalone token even with punctuation around it.
    return /(^|[^a-z0-9])paco([^a-z0-9]|$)/i.test(value);
  });

  if (hasPacoAlias) {
    return "Francisco Moral";
  }

  return name;
}
