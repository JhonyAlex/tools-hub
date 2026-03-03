"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Home, 
  FileText, 
  Settings, 
  BarChart3, 
  Palette, 
  Code2, 
  Mail,
  Wallet,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import type { ToolCategory } from "@/core/types/tool.types";
import { useSidebar } from "@/core/providers";

interface SidebarProps {
  categories: ToolCategory[];
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
  generators: "text-yellow-500 bg-yellow-500/10",
  reports: "text-blue-500 bg-blue-500/10",
  utilities: "text-gray-500 bg-gray-500/10",
  communication: "text-purple-500 bg-purple-500/10",
  seo: "text-green-500 bg-green-500/10",
  finance: "text-emerald-500 bg-emerald-500/10",
  design: "text-pink-500 bg-pink-500/10",
  development: "text-cyan-500 bg-cyan-500/10",
};

export function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { collapsed } = useSidebar();

  const isHomeActive = pathname === "/" && !currentCategory;

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r bg-muted/20 md:block transition-all duration-300 overflow-hidden",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {/* Home link */}
        <Link
          href="/"
          title={collapsed ? "Inicio" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
            isHomeActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <div className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
            isHomeActive 
              ? "bg-primary-foreground/20" 
              : "bg-muted group-hover:bg-background"
          )}>
            <Home className="h-4 w-4" />
          </div>
          {!collapsed && (
            <>
              <span>Inicio</span>
              {isHomeActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              )}
            </>
          )}
        </Link>

        {categories.length > 0 && (
          <>
            {!collapsed && (
              <div className="mt-5 mb-2 px-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Categorías
                </span>
              </div>
            )}
            {collapsed && <div className="mt-4 mb-2 border-t border-border/50" />}
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const isActive = currentCategory === cat;
                const colorClass = CATEGORY_COLORS[cat] || CATEGORY_COLORS.utilities;
                
                return (
                  <Link
                    key={cat}
                    href={`/?category=${cat}`}
                    title={collapsed ? CATEGORY_LABELS[cat] : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                      isActive 
                        ? "bg-background/80" 
                        : `bg-muted ${colorClass.split(' ')[1]} group-hover:bg-background`
                    )}>
                      <span className={cn(
                        isActive ? "text-foreground" : colorClass.split(' ')[0]
                      )}>
                        {CATEGORY_ICONS[cat]}
                      </span>
                    </div>
                    {!collapsed && (
                      <>
                        <span>{CATEGORY_LABELS[cat]}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/50" />
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Footer info */}
        {!collapsed && (
          <div className="mt-auto pt-6">
            <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Selecciona una herramienta para comenzar a trabajar.
              </p>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
