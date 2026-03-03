import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "maintenance-report",
  name: "Reporte Diario Mantenimiento",
  description:
    "Pigmea: genera el informe diario de OTs con análisis IA, histórico y paneles para compartir.",
  icon: "ClipboardList",
  category: "reports",
  status: "active",
  version: "1.0.0",
  author: "Tools Hub",
  tags: [
    "mantenimiento",
    "reporte",
    "OT",
    "pigmea",
    "preventivo",
    "value-keep",
    "diario",
  ],
  requiresDb: true,
  path: "/tools/maintenance-report",
};
