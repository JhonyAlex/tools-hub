"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  Zap,
  Mail,
  FileText,
  Wallet,
  Palette,
  Code2,
  ChevronDown,
  History,
  Star,
  Command,
  HelpCircle,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import type { ToolCategory } from "@/core/types/tool.types";
import { useSidebar } from "@/core/providers";
import { useState } from "react";

interface SidebarProps {
  categories: ToolCategory[];
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  generators: <Zap className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  utilities: <Settings className="h-4 w-4" />,
  communication: <Mail className="h-4 w-4" />,
  seo: <FileText className="h-4 w-4" />,
  finance: <Wallet className="h-4 w-4" />,
  design: <Palette className="h-4 w-4" />,
  development: <Code2 className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  generators: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  reports: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  utilities: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  communication: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  seo: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  finance: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  design: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  development: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  generators: "from-amber-500/20 to-orange-500/20",
  reports: "from-blue-500/20 to-indigo-500/20",
  utilities: "from-slate-500/20 to-zinc-500/20",
  communication: "from-violet-500/20 to-purple-500/20",
  seo: "from-emerald-500/20 to-teal-500/20",
  finance: "from-cyan-500/20 to-blue-500/20",
  design: "from-pink-500/20 to-rose-500/20",
  development: "from-sky-500/20 to-cyan-500/20",
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  badge?: React.ReactNode;
  colorClass?: string;
  isCategory?: boolean;
}

function NavItem({
  href,
  icon,
  label,
  isActive,
  collapsed,
  badge,
  colorClass = "",
  isCategory = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          isActive
            ? "bg-background/80 text-foreground"
            : cn(
                "bg-muted group-hover:bg-background",
                isCategory && colorClass
              )
        )}
      >
        {icon}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge}
          {isActive && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/50" />
          )}
        </>
      )}
    </Link>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsed: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  collapsed,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        <div className="border-t border-border/50 my-3" />
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <div
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Sidebar({ categories, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { collapsed, toggle, flyoutOpen, setFlyoutOpen } = useSidebar();

  const isHomeActive = pathname === "/" && !currentCategory;

  // Sort categories for consistent order
  const sortedCategories = [...categories].sort();

  // Determine if we should show expanded content (flyout mode)
  const showExpanded = flyoutOpen || !collapsed;

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r bg-muted/30 md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0",
        collapsed ? "w-16" : "w-64",
        className
      )}
      onMouseEnter={() => {
        if (collapsed) setFlyoutOpen(true);
      }}
      onMouseLeave={() => {
        if (collapsed) setFlyoutOpen(false);
      }}
    >
      {/* Flyout overlay when collapsed and hovered */}
      {collapsed && flyoutOpen && (
        <div
          className="absolute left-0 top-0 h-full w-64 bg-background border-r shadow-xl z-40 animate-in slide-in-from-left duration-200 flex flex-col"
          onMouseEnter={() => setFlyoutOpen(true)}
        >
          <nav className="flex-1 overflow-y-auto p-2">
            <SidebarContent
              sortedCategories={sortedCategories}
              isHomeActive={isHomeActive}
              currentCategory={currentCategory}
              collapsed={false}
              pathname={pathname}
            />
          </nav>
          <div className="shrink-0 p-2 border-t border-border/50 bg-background mt-auto">
            <SidebarFooter collapsed={false} toggle={toggle} />
          </div>
        </div>
      )}

      {/* Main nav content - scrollable */}
      <nav className="flex-1 overflow-y-auto p-2">
        <SidebarContent
          sortedCategories={sortedCategories}
          isHomeActive={isHomeActive}
          currentCategory={currentCategory}
          collapsed={collapsed}
          pathname={pathname}
        />
      </nav>
      
      {/* Footer - Always visible at bottom, aligned to screen edge */}
      <div className="shrink-0 p-2 border-t border-border/50 bg-muted/30 mt-auto">
        <SidebarFooter collapsed={collapsed} toggle={toggle} />
      </div>
    </aside>
  );
}

interface SidebarContentProps {
  sortedCategories: ToolCategory[];
  isHomeActive: boolean;
  currentCategory: string | null;
  collapsed: boolean;
  pathname: string;
}

function SidebarContent({
  sortedCategories,
  isHomeActive,
  currentCategory,
  collapsed,
  pathname,
}: SidebarContentProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
      {/* Home Link */}
      <NavItem
        href="/"
        icon={<Home className="h-4 w-4" />}
        label="Inicio"
        isActive={isHomeActive}
        collapsed={collapsed}
      />

      {/* Quick Access Section */}
      <CollapsibleSection
        title="Acceso Rápido"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        defaultOpen={true}
        collapsed={collapsed}
      >
        <NavItem
          href="/?filter=recent"
          icon={<History className="h-4 w-4" />}
          label="Recientes"
          isActive={searchParams.get("filter") === "recent"}
          collapsed={collapsed}
        />
        <NavItem
          href="/?filter=favorites"
          icon={<Star className="h-4 w-4" />}
          label="Favoritas"
          isActive={searchParams.get("filter") === "favorites"}
          collapsed={collapsed}
        />
      </CollapsibleSection>

      {/* Categories Section */}
      {sortedCategories.length > 0 && (
        <CollapsibleSection
          title="Categorías"
          icon={<Command className="h-3.5 w-3.5" />}
          defaultOpen={true}
          collapsed={collapsed}
        >
          <div className="space-y-0.5">
            {sortedCategories.map((cat) => {
              const isActive = currentCategory === cat;
              const colorClass = CATEGORY_COLORS[cat] || CATEGORY_COLORS.utilities;
              const gradientClass = CATEGORY_GRADIENTS[cat] || CATEGORY_GRADIENTS.utilities;

              return (
                <Link
                  key={cat}
                  href={`/?category=${cat}`}
                  title={collapsed ? CATEGORY_LABELS[cat] : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r shadow-sm"
                      : "hover:bg-accent/50",
                    isActive ? gradientClass : "",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200",
                      isActive
                        ? "bg-background/80 border-foreground/10"
                        : cn("bg-muted border-transparent", colorClass.split(" ")[2]),
                      isActive ? "" : colorClass.split(" ")[0]
                    )}
                  >
                    {CATEGORY_ICONS[cat]}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{CATEGORY_LABELS[cat]}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/50" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* System Section */}
      <CollapsibleSection
        title="Sistema"
        icon={<Settings className="h-3.5 w-3.5" />}
        defaultOpen={false}
        collapsed={collapsed}
      >
        <NavItem
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          label="Configuración"
          isActive={pathname === "/settings"}
          collapsed={collapsed}
        />
        <NavItem
          href="/help"
          icon={<HelpCircle className="h-4 w-4" />}
          label="Ayuda"
          isActive={pathname === "/help"}
          collapsed={collapsed}
        />
      </CollapsibleSection>
    </div>
  );
}

interface SidebarFooterProps {
  collapsed: boolean;
  toggle: () => void;
}

function SidebarFooter({ collapsed, toggle }: SidebarFooterProps) {
  return (
    <div className="space-y-2">
      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
          "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        title={collapsed ? "Expandir menú (⌘B)" : "Colapsar menú (⌘B)"}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between flex-1">
            <span>Colapsar</span>
            <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
              ⌘B
            </kbd>
          </div>
        )}
      </button>

      {/* Footer info - only when expanded */}
      {!collapsed && (
        <div className="mt-2 rounded-xl border border-border/50 bg-background/50 p-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tools Hub</span>
            <br />
            Selecciona una herramienta para comenzar.
            <br />
            <kbd className="mt-1 inline-block rounded border bg-muted px-1 font-mono text-[9px]">
              ⌘K
            </kbd>{" "}
            para buscar
          </p>
        </div>
      )}
    </div>
  );
}
