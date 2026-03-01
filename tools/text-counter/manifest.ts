import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "text-counter",
  name: "Contador de Texto",
  description:
    "Cuenta palabras, caracteres, oraciones y parrafos de cualquier texto.",
  icon: "LetterText",
  category: "utilities",
  status: "active",
  version: "1.0.0",
  author: "Tools Hub",
  tags: ["texto", "palabras", "caracteres", "contador"],
  requiresDb: false,
  path: "/tools/text-counter",
};
