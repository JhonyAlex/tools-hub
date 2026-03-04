"use client";

import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import { getCategoryStyle } from "@/core/styles/category-styles";

interface CategorySectionProps {
  category: ToolCategory;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  showViewAll?: boolean;
  count?: number;
}

export function CategorySection({
  category,
  icon: Icon,
  children,
  className,
  showViewAll = true,
  count,
}: CategorySectionProps) {
  const styles = getCategoryStyle(category);
  const label = CATEGORY_LABELS[category];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6",
        styles.sectionGradient,
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
