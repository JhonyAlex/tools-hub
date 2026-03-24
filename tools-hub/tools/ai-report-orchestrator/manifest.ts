import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "ai-report-orchestrator",
  name: "Orquestador IA de Informes",
  description:
    "Combina documentos, parametros y agentes IA para generar informes exportables en DOCX.",
  icon: "FileStack",
  category: "reports",
  status: "beta",
  version: "0.1.0",
  author: "Tools Hub",
  tags: [
    "informes",
    "orquestacion",
    "ia",
    "docx",
    "dashboard",
    "reportes",
  ],
  requiresDb: true,
  path: "/tools/ai-report-orchestrator",
};
