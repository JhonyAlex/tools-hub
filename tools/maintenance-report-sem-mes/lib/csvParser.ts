// ============================================================
// CSV PARSER - Parses Primavera "Mano de Obra" CSV exports
// Delimiter: semicolon (;)
// ============================================================
import Papa from "papaparse";
import type { LaborRecord } from "../types";

const COLUMN_MAP: Record<string, keyof LaborRecord> = {
  "Informe de Mano de Obra": "informeManoDeObra",
  "Orden de Trabajo": "ordenDeTrabajo",
  "Fecha Prevista (Europe/Madrid +01:00)": "fechaPrevista",
  "Fecha de Inicio (Europe/Madrid +01:00)": "fechaDeInicio",
  "Fecha de Fin (Europe/Madrid +01:00)": "fechaDeFin",
  "Descripción": "descripcion",
  "Tipo de OT": "tipoDeOT",
  "Tipo de Activo": "tipoDeActivo",
  "Activo": "activo",
  "Taller": "taller",
  "Trabajador": "trabajador",
  "Tiempo Total": "tiempoTotal",
  "Observaciones": "observaciones",
  "Plan de Mantenimiento": "planDeMantenimiento",
  "Observaciones OT": "observacionesOT",
  "Observaciones PM": "observacionesPM",
  "Observaciones Tareas": "observacionesTareas",
  "Tarea": "tarea",
  "Descripción tareas": "descripcionTareas",
};

export function parseCSV(csvText: string): LaborRecord[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
  });

  return result.data.map((row) => {
    const record: Partial<LaborRecord> = {};
    for (const [csvCol, fieldKey] of Object.entries(COLUMN_MAP)) {
      const value =
        row[csvCol] ??
        row[csvCol.trim()] ??
        Object.entries(row).find(([k]) => k.trim() === csvCol.trim())?.[1] ??
        "";
      (record as Record<string, string>)[fieldKey] = (value ?? "").trim();
    }
    return record as LaborRecord;
  });
}
