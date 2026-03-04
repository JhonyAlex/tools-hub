import type { ToolCategory } from "@/core/types/tool.types";

export interface CategoryStyle {
  // ToolCard
  bg: string;
  text: string;
  border: string;
  gradient: string;
  // CategorySection
  sectionGradient: string;
  iconBg: string;
  // Sidebar
  sidebarColor: string;
  sidebarGradient: string;
}

export const CATEGORY_THEME: Record<ToolCategory, CategoryStyle> = {
  generators: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-500/5 to-orange-500/5",
    sectionGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-amber-500/10",
    sidebarColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    sidebarGradient: "from-amber-500/20 to-orange-500/20",
  },
  reports: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    gradient: "from-blue-500/5 to-indigo-500/5",
    sectionGradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    iconBg: "bg-blue-500/10",
    sidebarColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    sidebarGradient: "from-blue-500/20 to-indigo-500/20",
  },
  utilities: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    gradient: "from-slate-500/5 to-zinc-500/5",
    sectionGradient: "from-slate-500/10 via-zinc-500/5 to-transparent",
    iconBg: "bg-slate-500/10",
    sidebarColor: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    sidebarGradient: "from-slate-500/20 to-zinc-500/20",
  },
  communication: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    gradient: "from-violet-500/5 to-purple-500/5",
    sectionGradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-violet-500/10",
    sidebarColor: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    sidebarGradient: "from-violet-500/20 to-purple-500/20",
  },
  seo: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/5 to-teal-500/5",
    sectionGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-emerald-500/10",
    sidebarColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    sidebarGradient: "from-emerald-500/20 to-teal-500/20",
  },
  finance: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/5 to-blue-500/5",
    sectionGradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-cyan-500/10",
    sidebarColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    sidebarGradient: "from-cyan-500/20 to-blue-500/20",
  },
  design: {
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20",
    gradient: "from-pink-500/5 to-rose-500/5",
    sectionGradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-pink-500/10",
    sidebarColor: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    sidebarGradient: "from-pink-500/20 to-rose-500/20",
  },
  development: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    gradient: "from-sky-500/5 to-cyan-500/5",
    sectionGradient: "from-sky-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-sky-500/10",
    sidebarColor: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    sidebarGradient: "from-sky-500/20 to-cyan-500/20",
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_THEME[category as ToolCategory] ?? CATEGORY_THEME.utilities;
}
