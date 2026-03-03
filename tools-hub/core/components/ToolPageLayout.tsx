"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, type ToolCategory } from "@/core/types/tool.types";

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

const CATEGORY_COLORS: Record<string, string> = {
  generators: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  reports: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  utilities: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  communication: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  seo: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  finance: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  design: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  development: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

export function ToolPageLayout({
  title,
  description,
  category,
  icon: Icon,
  breadcrumbs,
  children,
  className,
  actions,
  beta = false,
}: ToolPageLayoutProps) {
  const router = useRouter();

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    ...(category ? [{ label: CATEGORY_LABELS[category] }] : []),
    { label: title },
  ];

  const items = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
        {items.slice(1).map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0 rounded-full"
            title="Volver al inicio"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              {Icon && (
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border",
                    category
                      ? CATEGORY_COLORS[category]?.split(" ")[0]
                      : "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      category
                        ? CATEGORY_COLORS[category]?.split(" ")[1]
                        : "text-primary"
                    )}
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  {beta && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                    >
                      Beta
                    </Badge>
                  )}
                </div>
                {category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium mt-1",
                      CATEGORY_COLORS[category]
                    )}
                  >
                    {CATEGORY_LABELS[category]}
                  </Badge>
                )}
              </div>
            </div>
            {description && (
              <p className="text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 ml-14 sm:ml-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
