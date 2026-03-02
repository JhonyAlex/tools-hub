import { SemMesReportApp } from "@/tools/maintenance-report-sem-mes";

export default function MaintenanceReportSemMesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pigmea – Reporte Semanal/Mensual Mantenimiento
        </h1>
        <p className="mt-1 text-muted-foreground">
          Value Keep · Analiza la mano de obra por período, genera gráficos y análisis IA.
        </p>
      </div>
      <SemMesReportApp />
    </div>
  );
}
