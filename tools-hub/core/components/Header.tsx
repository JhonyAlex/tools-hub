"use client";
import { Wrench, Sparkles, PanelLeftClose, PanelLeftOpen, Github } from "lucide-react";
import Link from "next/link";
import { ThemeToggleSimple } from "./ThemeToggle";
import { CommandBar } from "./CommandBar";
import { useSidebar } from "@/core/providers";

export function Header() {
  const { collapsed, toggle } = useSidebar();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Sidebar toggle + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={collapsed ? "Abrir menú" : "Cerrar menú"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
              <Wrench className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">Tools Hub</span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">Panel de herramientas</span>
            </div>
          </Link>
        </div>

        {/* Center: Command Bar */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
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
