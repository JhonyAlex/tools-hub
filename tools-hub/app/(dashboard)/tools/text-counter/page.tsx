"use client";

import { LetterText } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { TextCounterApp } from "@/tools/text-counter";

export default function TextCounterPage() {
  return (
    <ToolPageLayout
      title="Contador de Texto"
      description="Análisis detallado de métricas de texto: palabras, caracteres, oraciones, párrafos y tiempo de lectura estimado."
      category="utilities"
      icon={LetterText}
    >
      <TextCounterApp />
    </ToolPageLayout>
  );
}
