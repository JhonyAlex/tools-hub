"use client";

import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";

interface CategorySectionProps {
  category: ToolCategory;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  showViewAll?: boolean;
  count?: number;
}

const CATEGORY_STYLES: Record<string, { gradient: string; text: string; border: string; iconBg: string }> = {
  generators: {
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
  },
  reports: {
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
  },
  utilities: {
    gradient: "from-slate-500/10 via-zinc-500/5 to-transparent",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    iconBg: "bg-slate-500/10",
  },
  communication: {
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
  },
  seo: {
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
  },
  finance: {
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
  },
  design: {
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/10",
  },
  development: {
    gradient: "from-sky-500/10 via-cyan-500/5 to-transparent",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    iconBg: "bg-sky-500/10",
  },
};

export function CategorySection({
  category,
  icon: Icon,
  children,
  className,
  showViewAll = true,
  count,
}: CategorySectionProps) {
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES.utilities;
  const label = CATEGORY_LABELS[category];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6",
        styles.gradient,
        styles.border,
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-background/50 to-transparent blur-3xl" />

      {/* Header */}
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                styles.iconBg,
                styles.border
              )}
            >
              <Icon className={cn("h-5 w-5", styles.text)} />
            </div>
          )}
          <div>
            <h2 className={cn("text-lg font-semibold tracking-tight", styles.text)}>
              {label}
            </h2>
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {count} herramienta{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {showViewAll && (
          <Link
            href={`/?category=${category}`}
            className={cn(
              "group flex items-center gap-1 text-sm font-medium transition-colors hover:underline",
              styles.text
            )}
          >
            Ver todas
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Content Grid */}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}

interface CategoryGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function CategoryGrid({
  children,
  className,
  columns = 3,
}: CategoryGridProps) {
  const columnsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnsClass[columns], className)}>
      {children}
    </div>
  );
}
