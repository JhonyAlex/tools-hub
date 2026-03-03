"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToolInfo } from "@/core/providers";
import type { ToolCategory } from "@/core/types/tool.types";
import type { LucideIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ToolPageLayoutProps {
  title: string;
  description?: string;
  category?: ToolCategory;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  beta?: boolean;
}

export function ToolPageLayout({
  title,
  description,
  category,
  icon,
  breadcrumbs,
  children,
  className,
  actions,
  beta = false,
}: ToolPageLayoutProps) {
  const { setToolInfo, clearToolInfo } = useToolInfo();

  // Set tool info in header on mount, clear on unmount
  useEffect(() => {
    setToolInfo({
      title,
      description,
      category,
      icon,
      breadcrumbs,
      beta,
    });

    return () => {
      clearToolInfo();
    };
  }, [title, description, category, icon, breadcrumbs, beta, setToolInfo, clearToolInfo]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Actions bar - only if actions provided */}
      {actions && (
        <div className="flex items-center justify-end gap-2">{actions}</div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
