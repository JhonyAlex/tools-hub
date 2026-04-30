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
  "Fecha": "fecha",
  "Tipo de OT": "tipoDeOT",
  "Tipo de Activo": "tipoDeActivo",
  "Activo": "activo",
  "Taller": "taller",
  "Fecha de Fin Esperada": "fechaDeFinEsperada",
  "Nivel de Prioridad": "nivelDePrioridad",
  "Fecha Prevista": "fechaPrevista",
  "Fecha de Fin de SLA": "fechaDeFinDeSLA",
  "Fecha de Inicio de SLA": "fechaDeInicioDeSLA",
  "Descripción Plan": "descripcionPlan",
  "Observaciones": "observaciones",
  "Equipamiento 2": "equipamiento2",
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/\(Europe\/Madrid[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function parseCSV(csvText: string): OTRecord[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data.map((row) => {
    const normalizedRow = new Map<string, string>();
    for (const [key, value] of Object.entries(row)) {
      normalizedRow.set(normalizeHeader(key), value ?? "");
    }

    const record: Partial<OTRecord> = {};
    for (const [csvCol, fieldKey] of Object.entries(COLUMN_MAP)) {
      // Support exact headers and timezone-variant headers like +01:00 and +02:00 DST.
      const value =
        row[csvCol] ??
        row[csvCol.trim()] ??
        normalizedRow.get(normalizeHeader(csvCol)) ??
        Object.entries(row).find(([k]) => normalizeHeader(k) === normalizeHeader(csvCol))?.[1] ??
        "";
      (record as Record<string, string>)[fieldKey] = (value ?? "").trim();
    }
    return record as OTRecord;
  });
}
