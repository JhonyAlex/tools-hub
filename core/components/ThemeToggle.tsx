"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light" as const, label: "Claro", icon: Sun },
  { value: "dark" as const, label: "Oscuro", icon: Moon },
  { value: "system" as const, label: "Sistema", icon: Monitor },
];

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium opacity-50">
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Tema</span>
      </button>
    );
  }

  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Cambiar tema"
        aria-expanded={isOpen}
      >
        <Icon className="h-4 w-4 transition-transform duration-300" />
        <span className="hidden sm:inline">{currentTheme.label}</span>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg transition-all duration-200",
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-2 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {themes.map((t) => {
          const ThemeIcon = t.icon;
          const isActive = theme === t.value;

          return (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              <ThemeIcon className="h-4 w-4" />
              <span>{t.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Simple toggle button for quick theme switching
export function ThemeToggleSimple() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch - render placeholder during SSR
  if (!mounted) {
    return (
      <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background opacity-50">
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return <ThemeToggleSimpleInner />;
}

function ThemeToggleSimpleInner() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      </span>
    </button>
  );
}
