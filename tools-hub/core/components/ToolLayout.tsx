"use client";

import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarWidth?: "sm" | "md" | "lg";
  reverse?: boolean;
}

const widthClasses = {
  sm: "lg:w-64",
  md: "lg:w-72",
  lg: "lg:w-80",
};

/**
 * ToolLayout - Standard two-column layout for tools
 * Provides a consistent structure with sidebar (inputs/config) and main area (results)
 * Minimalist design: no rigid boxes, visual grouping by proximity
 */
export function ToolLayout({
  sidebar,
  children,
  className,
  sidebarWidth = "md",
  reverse = false,
}: ToolLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-8",
        sidebar
          ? `grid-cols-1 lg:grid-cols-[${reverse ? "1fr_" : ""}${widthClasses[sidebarWidth]}${reverse ? "" : "_1fr"}]`
          : "grid-cols-1",
        reverse && sidebar && "lg:grid-cols-[1fr_auto]",
        className
      )}
      style={
        sidebar
          ? {
              gridTemplateColumns: reverse
                ? `1fr var(--sidebar-width, 288px)`
                : `var(--sidebar-width, 288px) 1fr`,
            }
          : undefined
      }
    >
      {sidebar && !reverse && (
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {sidebar}
        </aside>
      )}
      <main className="min-w-0 space-y-6">{children}</main>
      {sidebar && reverse && (
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {sidebar}
        </aside>
      )}
    </div>
  );
}

interface ToolSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "ghost";
  actions?: React.ReactNode;
}

/**
 * ToolSection - Container for sections within a tool
 * Minimalist: no borders, subtle backgrounds only when needed
 */
export function ToolSection({
  title,
  description,
  children,
  className,
  variant = "default",
  actions,
}: ToolSectionProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variant === "subtle" && "bg-muted/20 p-5",
        variant === "ghost" && "p-2",
        variant === "default" && "",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface ToolInputPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

/**
 * ToolInputPanel - Sidebar panel for inputs and configuration
 * Minimalist: subtle background to differentiate from output, no heavy borders
 */
export function ToolInputPanel({
  title,
  description,
  children,
  className,
  footer,
}: ToolInputPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-muted/15 overflow-hidden",
        className
      )}
    >
      {(title || description) && (
        <div className="px-4 py-3 border-b border-border/30">
          {title && (
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}
      <div className="p-4 space-y-4">{children}</div>
      {footer && (
        <div className="border-t border-border/30 bg-muted/10 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

interface ToolOutputPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  empty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * ToolOutputPanel - Main panel for results and output
 * Minimalist: no background, clean separation by spacing and typography
 */
export function ToolOutputPanel({
  title,
  description,
  children,
  className,
  actions,
  empty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: ToolOutputPanelProps) {
  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between px-1 py-3 mb-2">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="min-h-0">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {emptyIcon && (
              <div className="mb-4 rounded-2xl bg-muted/30 p-4">{emptyIcon}</div>
            )}
            {emptyTitle && (
              <h4 className="text-sm font-medium text-foreground">
                {emptyTitle}
              </h4>
            )}
            {emptyDescription && (
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                {emptyDescription}
              </p>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
