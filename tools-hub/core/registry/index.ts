import { TOOL_REGISTRY } from "./tools.registry";
import type { ToolManifest, ToolCategory } from "@/core/types/tool.types";

export function getAllTools(): ToolManifest[] {
  return TOOL_REGISTRY.filter((t) => t.status !== "hidden");
}

export function getToolsByCategory(category: ToolCategory): ToolManifest[] {
  return getAllTools().filter((t) => t.category === category);
}

export function getToolBySlug(slug: string): ToolManifest | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function searchTools(query: string): ToolManifest[] {
  const q = query.toLowerCase();
  return getAllTools().filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
  );
}

export function getCategories(): ToolCategory[] {
  const cats = new Set(getAllTools().map((t) => t.category));
  return Array.from(cats);
}
