import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "maintenance-report-sem-mes",
  name: "Reporte Semanal/Mensual Mantenimiento",
  description:
    "Pigmea: genera informes semanales o mensuales de mano de obra con análisis IA, gráficos y histórico.",
  icon: "CalendarRange",
  category: "reports",
  status: "active",
  version: "1.0.0",
  author: "Tools Hub",
  tags: [
    "mantenimiento",
    "reporte",
    "semanal",
    "mensual",
    "OT",
    "pigmea",
    "mano-de-obra",
    "value-keep",
  ],
  requiresDb: true,
  path: "/tools/maintenance-report-sem-mes",
};
