// ============================================================
// TOOL TYPES - Core type definitions for the Tools Hub
// This file defines the contract that ALL tools must follow.
// ============================================================

export type ToolCategory =
  | "generators"
  | "reports"
  | "utilities"
  | "communication"
  | "seo"
  | "finance"
  | "design"
  | "development";

export type ToolStatus =
  | "active" // Visible and fully usable
  | "beta" // Visible with a "beta" badge
  | "maintenance" // Visible but shows a warning
  | "hidden"; // Exists but not shown in dashboard

export interface ToolManifest {
  /** Must match folder name exactly: 'budget-generator' */
  slug: string;
  /** Display name: 'Budget Generator' */
  name: string;
  /** One sentence, shown in the dashboard card */
  description: string;
  /** Lucide icon name: 'Calculator' */
  icon: string;
  /** Tool category for filtering */
  category: ToolCategory;
  /** Controls visibility and badges */
  status: ToolStatus;
  /** Semver: '1.0.0' */
  version: string;
  /** Who built it */
  author: string;
  /** Search tags: ['budget', 'finance', 'pdf'] */
  tags: string[];
  /** Does this tool use the database? */
  requiresDb: boolean;
  /** Route path, auto-derived: '/tools/budget-generator' */
  path: string;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  generators: "Generadores",
  reports: "Reportes",
  utilities: "Utilidades",
  communication: "Comunicacion",
  seo: "SEO",
  finance: "Finanzas",
  design: "Diseno",
  development: "Desarrollo",
};

export const STATUS_LABELS: Record<ToolStatus, string> = {
  active: "Activo",
  beta: "Beta",
  maintenance: "En Mantenimiento",
  hidden: "Oculto",
};
