import { BarChart3 } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { SemMesReportApp } from "@/tools/maintenance-report-sem-mes";

export default function MaintenanceReportSemMesPage() {
  return (
    <ToolPageLayout
      title="Reporte Semanal/Mensual"
      description="Value Keep · Analiza la mano de obra por período, genera gráficos y análisis IA."
      category="reports"
      icon={BarChart3}
    >
      <SemMesReportApp />
    </ToolPageLayout>
  );
}
