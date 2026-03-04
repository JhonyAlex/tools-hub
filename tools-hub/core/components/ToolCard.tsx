"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ToolManifest } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import { getCategoryStyle } from "@/core/styles/category-styles";

interface ToolCardProps {
  tool: ToolManifest;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  onVisit?: (slug: string) => void;
}

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  return Icon ? <Icon className="h-6 w-6" /> : <LucideIcons.Box className="h-6 w-6" />;
}

export function ToolCard({ tool, className, isFavorite, onToggleFavorite, onVisit }: ToolCardProps) {
  const styles = getCategoryStyle(tool.category);

  return (
    <Link
      href={tool.path}
      onClick={() => onVisit?.(tool.slug)}
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

          <div className="flex items-start gap-1.5">
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
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(tool.slug);
                }}
                className={cn(
                  "rounded-lg p-1.5 transition-colors hover:bg-accent",
                  isFavorite
                    ? "text-amber-500"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                )}
                aria-label={isFavorite ? "Quitar de favoritas" : "Agregar a favoritas"}
              >
                <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              </button>
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
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  onVisit?: (slug: string) => void;
}

export function ToolCardCompact({ tool, className, isFavorite, onToggleFavorite, onVisit }: ToolCardCompactProps) {
  const styles = getCategoryStyle(tool.category);

  return (
    <Link
      href={tool.path}
      onClick={() => onVisit?.(tool.slug)}
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
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(tool.slug);
          }}
          className={cn(
            "shrink-0 rounded-lg p-1.5 transition-colors hover:bg-accent",
            isFavorite
              ? "text-amber-500"
              : "text-muted-foreground/40 hover:text-muted-foreground"
          )}
          aria-label={isFavorite ? "Quitar de favoritas" : "Agregar a favoritas"}
        >
          <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
    </Link>
  );
}
