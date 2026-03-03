import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
    slug: "doc-chat",
    name: "DocChat",
    description:
        "Lector interactivo con IA: sube documentos, chatea con ellos y exporta a AurisLM.",
    icon: "FileText",
    category: "utilities",
    status: "beta",
    version: "1.0.0",
    author: "Tools Hub",
    tags: ["IA", "documentos", "chat", "lector", "PDF", "role-playing"],
    requiresDb: true,
    path: "/tools/doc-chat",
};
