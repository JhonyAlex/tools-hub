import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "json-formatter",
  name: "JSON Formatter",
  description: "Formatea, valida y embellece JSON con deteccion de errores.",
  icon: "Braces",
  category: "development",
  status: "active",
  version: "1.0.0",
  author: "Tools Hub",
  tags: ["json", "formatter", "validator", "dev"],
  requiresDb: false,
  path: "/tools/json-formatter",
};
