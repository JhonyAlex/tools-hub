// ============================================================
// WORKER NAME TRANSFORM - Business rules for worker names
// ============================================================

/**
 * Transform worker names:
 * - "Jose Gallego" + "Paco" in observacionesOT -> "Francisco Moral"
 * - All other cases remain unchanged
 */
export function transformWorkerName(
  trabajador: string,
  observacionesOT: string
): string {
  const name = trabajador.trim();
  if (name.toLowerCase() === "jose gallego") {
    if (/paco/i.test(observacionesOT)) {
      return "Francisco Moral";
    }
  }
  return name;
}
