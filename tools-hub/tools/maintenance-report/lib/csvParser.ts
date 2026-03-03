// ============================================================
// CSV PARSER - Parses Primavera maintenance CSV exports
// Delimiter: semicolon (;)
// ============================================================
import Papa from "papaparse";
import type { OTRecord } from "../types";

const COLUMN_MAP: Record<string, keyof OTRecord> = {
  "Estado": "estado",
  "Orden de Trabajo": "ordenDeTrabajo",
  "Descripción": "descripcion",
  "Fecha (Europe/Madrid +01:00)": "fecha",
  "Tipo de OT": "tipoDeOT",
  "Tipo de Activo": "tipoDeActivo",
  "Activo": "activo",
  "Taller": "taller",
  "Fecha de Fin Esperada (Europe/Madrid +01:00)": "fechaDeFinEsperada",
  "Nivel de Prioridad": "nivelDePrioridad",
  "Fecha Prevista (Europe/Madrid +01:00)": "fechaPrevista",
  "Fecha de Fin de SLA (Europe/Madrid +01:00)": "fechaDeFinDeSLA",
  "Fecha de Inicio de SLA (Europe/Madrid +01:00)": "fechaDeInicioDeSLA",
  "Descripción Plan": "descripcionPlan",
  "Observaciones": "observaciones",
  "Equipamiento 2": "equipamiento2",
};

export function parseCSV(csvText: string): OTRecord[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data.map((row) => {
    const record: Partial<OTRecord> = {};
    for (const [csvCol, fieldKey] of Object.entries(COLUMN_MAP)) {
      // Try exact, trimmed, and partial match
      const value =
        row[csvCol] ??
        row[csvCol.trim()] ??
        Object.entries(row).find(([k]) => k.trim() === csvCol.trim())?.[1] ??
        "";
      (record as Record<string, string>)[fieldKey] = (value ?? "").trim();
    }
    return record as OTRecord;
  });
}
