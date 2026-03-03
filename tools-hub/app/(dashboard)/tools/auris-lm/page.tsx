"use client";

import { MessageSquare } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { AurisLMApp } from "@/tools/auris-lm";

export default function AurisLMPage() {
  return (
    <ToolPageLayout
      title="AurisLM"
      description="Workspace RAG · Sube documentos y audios, chatea con la IA usando exclusivamente tu contenido."
      category="generators"
      icon={MessageSquare}
      beta
    >
      <AurisLMApp />
    </ToolPageLayout>
  );
}
