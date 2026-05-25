// ============================================================
// WORKER NAME TRANSFORM - Business rules for worker names
// ============================================================

/**
 * Transform worker names:
 * - Only transforms when the trabajador field is empty or missing (not assigned)
 * - If any observation field contains "paco" as a standalone reference,
 *   assign "Francisco Moral" as the worker
 * - Never overrides an existing valid worker name to avoid false positives
 *   (e.g. "Paco" mentioned as a collaborator should not reassign the primary worker)
 */
export function transformWorkerName(
  trabajador: string,
  ...observationFields: Array<string | undefined>
): string {
  const name = trabajador.trim();

  if (name) {
    return name;
  }

  const hasPacoAlias = observationFields.some((value) => {
    if (!value) return false;
    return /(^|[^\p{L}\p{N}])paco([^\p{L}\p{N}]|$)/iu.test(value);
  });

  if (hasPacoAlias) {
    return "Francisco Moral";
  }

  return name;
}
