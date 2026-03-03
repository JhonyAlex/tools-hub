"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { ToolCategory } from "@/core/types/tool.types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ToolInfo {
  title: string;
  description?: string;
  category?: ToolCategory;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  beta?: boolean;
}

interface ToolContextValue {
  toolInfo: ToolInfo | null;
  setToolInfo: (info: ToolInfo | null) => void;
  clearToolInfo: () => void;
}

const ToolContext = createContext<ToolContextValue>({
  toolInfo: null,
  setToolInfo: () => {},
  clearToolInfo: () => {},
});

export function ToolProvider({ children }: { children: ReactNode }) {
  const [toolInfo, setToolInfo] = useState<ToolInfo | null>(null);

  const clearToolInfo = useCallback(() => {
    setToolInfo(null);
  }, []);

  return (
    <ToolContext.Provider value={{ toolInfo, setToolInfo, clearToolInfo }}>
      {children}
    </ToolContext.Provider>
  );
}

export function useToolInfo() {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("useToolInfo must be used within a ToolProvider");
  }
  return context;
}

/**
 * Hook to set the active tool info from within a tool page.
 * Automatically clears when the component unmounts.
 */
export function useSetActiveTool(info: ToolInfo) {
  const { setToolInfo, clearToolInfo } = useToolInfo();

  useState(() => {
    setToolInfo(info);
  });

  // Clear on unmount is handled by the component using this hook
  return { clearToolInfo };
}
