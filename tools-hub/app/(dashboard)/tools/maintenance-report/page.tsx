"use client";

import { BarChart3 } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { MaintenanceReportApp } from "@/tools/maintenance-report";

export default function MaintenanceReportPage() {
  return (
    <ToolPageLayout
      title="Reporte Diario Mantenimiento"
      description="Value Keep · Analiza el CSV de Primavera, genera el resumen diario, detecta incidencias y guarda el histórico."
      category="reports"
      icon={BarChart3}
    >
      <MaintenanceReportApp />
    </ToolPageLayout>
  );
}
