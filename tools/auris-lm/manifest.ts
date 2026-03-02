import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "auris-lm",
  name: "AurisLM",
  description:
    "Workspace RAG: sube PDFs, TXTs y audios (transcripción automática via Deepgram), luego chatea con la IA usando exclusivamente el contenido de tus documentos.",
  icon: "BookOpen",
  category: "utilities",
  status: "beta",
  version: "1.0.0",
  author: "Tools Hub",
  tags: ["IA", "RAG", "documentos", "chat", "transcripción", "audio", "PDF", "workspace"],
  requiresDb: true,
  path: "/tools/auris-lm",
};
