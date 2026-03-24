"use client";

import { FileStack } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { AIReportOrchestratorApp } from "@/tools/ai-report-orchestrator";

export default function AIReportOrchestratorPage() {
  return (
    <ToolPageLayout
      title="Orquestador IA de Informes"
      description="Sube multiples documentos, configura alcance y genera informes compuestos listos para exportar."
      category="reports"
      icon={FileStack}
      beta
    >
      <AIReportOrchestratorApp />
    </ToolPageLayout>
  );
}
