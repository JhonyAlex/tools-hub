"use client";

import { FileText } from "lucide-react";
import { ToolPageLayout } from "@/core/components/ToolPageLayout";
import { DocChatApp } from "@/tools/doc-chat";

export default function DocChatPage() {
    return (
        <ToolPageLayout
            title="DocChat"
            description="Lector interactivo con IA · Sube documentos, chatea con ellos y exporta a AurisLM."
            category="utilities"
            icon={FileText}
            beta
        >
            <DocChatApp />
        </ToolPageLayout>
    );
}
