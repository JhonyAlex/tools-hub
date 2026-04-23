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
    <section className={cn("relative flex flex-col gap-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {label}
            </h2>
            {count !== undefined && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {count} herramienta{count !== 1 ? "s" : ""} disponibles
              </p>
            )}
          </div>
        </div>

        {showViewAll && (
          <Link
            href={`/?category=${category}`}
            className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explorar categoría
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
