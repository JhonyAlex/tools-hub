// ============================================================
// TOOL REGISTRY
// To add a new tool: import its manifest and add it to the array.
// Order here = display order on the dashboard home page.
// ============================================================

import type { ToolManifest } from "@/core/types/tool.types";

import { manifest as textCounter } from "@/tools/text-counter/manifest";
import { manifest as jsonFormatter } from "@/tools/json-formatter/manifest";
import { manifest as maintenanceReport } from "@/tools/maintenance-report/manifest";
import { manifest as maintenanceReportSemMes } from "@/tools/maintenance-report-sem-mes/manifest";
import { manifest as aurisLm } from "@/tools/auris-lm/manifest";
import { manifest as docChat } from "@/tools/doc-chat/manifest";
// --- ADD NEW TOOL IMPORTS ABOVE THIS LINE ---

export const TOOL_REGISTRY: ToolManifest[] = [
  maintenanceReport,
  maintenanceReportSemMes,
  aurisLm,
  textCounter,
  jsonFormatter,
  docChat,
  // --- ADD NEW TOOLS TO THIS ARRAY ABOVE THIS LINE ---
];
