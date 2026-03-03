import { MaintenanceReportApp } from "@/tools/maintenance-report";

export default function MaintenanceReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pigmea – Reporte Diario Mantenimiento
        </h1>
        <p className="mt-1 text-muted-foreground">
          Value Keep · Analiza el CSV de Primavera, genera el resumen diario, detecta incidencias y guarda el histórico.
        </p>
      </div>
      <MaintenanceReportApp />
    </div>
  );
}
