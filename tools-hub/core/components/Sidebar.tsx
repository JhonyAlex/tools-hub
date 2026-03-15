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
import type { ToolCategory, ToolManifest } from "@/core/types/tool.types";
import { getCategoryStyle } from "@/core/styles/category-styles";
import { useSidebar } from "@/core/providers";
import { useFavorites } from "@/core/hooks/useFavorites";
import { getToolBySlug } from "@/core/registry";
import { useState, useMemo } from "react";

interface SidebarProps {
  categories: ToolCategory[];
  className?: string;
}

interface SidebarHeaderProps {
  collapsed: boolean;
  toggle: () => void;
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

function SidebarHeader({ collapsed, toggle }: SidebarHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 border-b border-border/50 bg-muted/30">
      <p className="text-[11px] text-muted-foreground leading-relaxed min-w-0">
        <span className="font-semibold text-foreground">Tools Hub</span>
        <br />
        <kbd className="mt-1 inline-block rounded border bg-muted px-1 font-mono text-[9px]">
          ⌘K
        </kbd>{" "}
        para buscar
      </p>
      <button
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        title={collapsed ? "Expandir menú (⌘B)" : "Colapsar menú (⌘B)"}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>
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
        "hidden shrink-0 border-r bg-muted/30 md:flex flex-col transition-all duration-300 ease-in-out h-full",
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
          <SidebarHeader collapsed={collapsed} toggle={toggle} />
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
            <SidebarFooter collapsed={false} />
          </div>
        </div>
      )}

      {/* Header con Tools Hub - solo cuando está expandido */}
      {!collapsed && (
        <SidebarHeader collapsed={collapsed} toggle={toggle} />
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
        <SidebarFooter collapsed={collapsed} />
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
  const { favorites } = useFavorites();

  // Resolver slugs favoritos a herramientas
  const favoriteTools = useMemo(() => {
    return favorites
      .map((slug) => getToolBySlug(slug))
      .filter((tool): tool is ToolManifest => tool !== undefined && tool.status !== "hidden");
  }, [favorites]);

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

      {/* Favorites Section - Show favorite tools directly */}
      {favoriteTools.length > 0 && (
        <CollapsibleSection
          title="Favoritos"
          icon={<Star className="h-3.5 w-3.5" />}
          defaultOpen={true}
          collapsed={collapsed}
        >
          <div className="space-y-0.5">
            {favoriteTools.map((tool) => (
              <NavItem
                key={tool.slug}
                href={tool.path}
                icon={<Sparkles className="h-4 w-4" />}
                label={tool.name}
                isActive={pathname === tool.path}
                collapsed={collapsed}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Recent Access Section */}
      <CollapsibleSection
        title="Acceso Rápido"
        icon={<History className="h-3.5 w-3.5" />}
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
              const catStyle = getCategoryStyle(cat);
              const colorClass = catStyle.sidebarColor;
              const gradientClass = catStyle.sidebarGradient;

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
}

function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-2 py-1 text-[11px] leading-relaxed text-muted-foreground">
          Hecho por{" "}
          <a
            href="https://cambiodigital.net"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            Cambiodigital.net
          </a>
        </p>
      )}
    </div>
  );
}
