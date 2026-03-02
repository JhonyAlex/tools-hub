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
// --- ADD NEW TOOL IMPORTS ABOVE THIS LINE ---

export const TOOL_REGISTRY: ToolManifest[] = [
  maintenanceReport,
  maintenanceReportSemMes,
  textCounter,
  jsonFormatter,
  // --- ADD NEW TOOLS TO THIS ARRAY ABOVE THIS LINE ---
];
