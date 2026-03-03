"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Command, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getAllTools } from "@/core/registry";
import type { ToolManifest } from "@/core/types/tool.types";

interface CommandBarProps {
  className?: string;
}

export function CommandBar({ className }: CommandBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const tools = getAllTools();
  const filteredTools = query
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : tools;

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (tool: ToolManifest) => {
      router.push(tool.path);
      setIsOpen(false);
      setQuery("");
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredTools.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredTools[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    },
    [filteredTools, selectedIndex, handleSelect]
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "group flex items-center gap-2 rounded-lg border bg-background/80 px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar herramientas...</span>
        <span className="sr-only">Abrir búsqueda</span>
        <kbd className="pointer-events-none ml-2 hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed left-1/2 top-[20%] w-full max-w-xl -translate-x-1/2 animate-in zoom-in-95 slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-xl border bg-background shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="rounded-full p-1 hover:bg-accent"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <kbd className="hidden h-7 items-center rounded border bg-muted px-2 font-mono text-xs font-medium md:flex">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto py-2">
                {filteredTools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No se encontraron herramientas
                    </p>
                  </div>
                ) : (
                  <div className="px-2">
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                      Herramientas ({filteredTools.length})
                    </div>
                    {filteredTools.map((tool, index) => (
                      <button
                        key={tool.slug}
                        onClick={() => handleSelect(tool)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          selectedIndex === index
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Command className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{tool.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                        {tool.status === "beta" && (
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                            Beta
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-background px-1 font-mono">↑↓</kbd>
                    <span>para navegar</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-background px-1 font-mono">↵</kbd>
                    <span>para seleccionar</span>
                  </span>
                </div>
                <span>{filteredTools.length} herramientas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
