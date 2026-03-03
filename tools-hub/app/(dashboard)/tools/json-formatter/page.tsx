"use client";

import { Braces } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { JsonFormatterApp } from "@/tools/json-formatter";

export default function JsonFormatterPage() {
  return (
    <ToolPageLayout
      title="JSON Formatter"
      description="Formatea, valida y embellece JSON con detección de errores."
      category="utilities"
      icon={Braces}
    >
      <JsonFormatterApp />
    </ToolPageLayout>
  );
}
