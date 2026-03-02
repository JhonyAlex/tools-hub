"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subValue?: string;
  variant?: "default" | "warning" | "destructive" | "success" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    bg: "bg-muted/50",
    border: "border-border",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  warning: {
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-amber-700 dark:text-amber-300",
  },
  destructive: {
    bg: "bg-red-50/50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    valueColor: "text-red-700 dark:text-red-300",
  },
  success: {
    bg: "bg-green-50/50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-green-700 dark:text-green-300",
  },
  info: {
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-blue-700 dark:text-blue-300",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  variant = "default",
  trend,
  className,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        styles.bg,
        styles.border,
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            styles.iconBg,
            styles.iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-2xl font-bold", styles.valueColor)}>
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for dense layouts
export function StatCardCompact({
  icon: Icon,
  label,
  value,
  variant = "default",
  className,
}: Omit<StatCardProps, "subValue" | "trend" | "onClick">) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
        "hover:shadow-sm",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          styles.iconBg,
          styles.iconColor
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={cn("text-lg font-semibold", styles.valueColor)}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Grid of stat cards
interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatGrid({
  children,
  columns = 3,
  className,
}: StatGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div
      className={cn(
        "grid gap-3 animate-in stagger-children",
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
