"use client";

import { Wrench, Sparkles, Github, Menu, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { ThemeToggleSimple } from "./ThemeToggle";
import { CommandBar } from "./CommandBar";
import { useToolInfo } from "@/core/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { getCategories } from "@/core/registry";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import { useState } from "react";

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

export function Header() {
  const { toolInfo } = useToolInfo();
  const categories = getCategories();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left section: Mobile menu + Logo/Tool info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mobile Menu - Only visible on mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar categories={categories} className="md:hidden !flex" />
            </SheetContent>
          </Sheet>

          {/* Dynamic Zone: Tool info or Logo */}
          {toolInfo ? (
            <div className="flex items-center gap-3 min-w-0">
              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                </Link>
                {toolInfo.category && (
                  <div className="flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-muted-foreground">
                      {CATEGORY_LABELS[toolInfo.category]}
                    </span>
                  </div>
                )}
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium truncate max-w-[150px]">
                  {toolInfo.title}
                </span>
              </nav>

              {/* Tool Title + Icon - Mobile friendly */}
              <div className="flex items-center gap-2.5 min-w-0">
                {toolInfo.icon && (
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border shrink-0",
                      toolInfo.category
                        ? CATEGORY_COLORS[toolInfo.category]?.split(" ")[0]
                        : "bg-primary/10"
                    )}
                  >
                    <toolInfo.icon
                      className={cn(
                        "h-4 w-4",
                        toolInfo.category
                          ? CATEGORY_COLORS[toolInfo.category]?.split(" ")[1]
                          : "text-primary"
                      )}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-semibold tracking-tight truncate">
                      {toolInfo.title}
                    </h1>
                    {toolInfo.beta && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1.5 py-0"
                      >
                        Beta
                      </Badge>
                    )}
                  </div>
                  {toolInfo.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                      {toolInfo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/"
              className="group flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight">Tools Hub</span>
                <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                  Panel de herramientas
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Center: Command Bar - Hidden on mobile */}
        <div className="flex-1 max-w-md mx-auto hidden lg:block">
          <CommandBar className="w-full" />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>v1.0</span>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Ver en GitHub"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* Theme toggle */}
          <ThemeToggleSimple />
        </div>
      </div>
    </header>
  );
}
