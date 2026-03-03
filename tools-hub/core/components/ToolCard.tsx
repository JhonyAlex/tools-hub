"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ToolManifest } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";

interface ToolCardProps {
  tool: ToolManifest;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  generators: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-500/5 to-orange-500/5",
  },
  reports: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    gradient: "from-blue-500/5 to-indigo-500/5",
  },
  utilities: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    gradient: "from-slate-500/5 to-zinc-500/5",
  },
  communication: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    gradient: "from-violet-500/5 to-purple-500/5",
  },
  seo: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/5 to-teal-500/5",
  },
  finance: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/5 to-blue-500/5",
  },
  design: {
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20",
    gradient: "from-pink-500/5 to-rose-500/5",
  },
  development: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    gradient: "from-sky-500/5 to-cyan-500/5",
  },
};

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  return Icon ? <Icon className="h-6 w-6" /> : <LucideIcons.Box className="h-6 w-6" />;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.utilities;

  return (
    <Link
      href={tool.path}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-5 transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
        "hover:border-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Hover gradient background */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header: Icon + Badges */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
              "group-hover:scale-110 group-hover:shadow-lg",
              styles.bg,
              styles.border,
              styles.text
            )}
          >
            {getIcon(tool.icon)}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {tool.status === "beta" && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
              >
                Beta
              </Badge>
            )}
            {tool.status === "maintenance" && (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 border-red-200 text-[10px] dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
              >
                Mantenimiento
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {tool.description}
        </p>

        {/* Footer: Category + Tags */}
        <div className="flex flex-col gap-2.5">
          <Badge
            variant="outline"
            className={cn(
              "w-fit text-[10px] font-medium uppercase tracking-wide",
              styles.text,
              styles.bg,
              styles.border
            )}
          >
            {CATEGORY_LABELS[tool.category]}
          </Badge>

          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors group-hover:bg-accent"
                >
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator line */}
      <div
        className={cn(
          "absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100",
          styles.bg.replace("/10", "")
        )}
      />
    </Link>
  );
}

// Compact variant for dense layouts
interface ToolCardCompactProps {
  tool: ToolManifest;
  className?: string;
}

export function ToolCardCompact({ tool, className }: ToolCardCompactProps) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.utilities;

  return (
    <Link
      href={tool.path}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
          styles.bg,
          styles.border,
          styles.text
        )}
      >
        {getIcon(tool.icon)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium">{tool.name}</h4>
          {tool.status === "beta" && (
            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              BETA
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
