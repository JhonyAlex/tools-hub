"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  flyoutOpen: boolean;
  setFlyoutOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
  flyoutOpen: false,
  setFlyoutOpen: () => {},
});

const STORAGE_KEY = "tools-hub-sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage value (client-side only)
  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [flyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setCollapsedState(saved === "true");
      }
    } catch (error) {
      // localStorage might not be available
      console.warn("Could not read sidebar state from localStorage:", error);
    }
  }, []);

  // Persist to localStorage when collapsed changes
  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      console.warn("Could not save sidebar state to localStorage:", error);
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Keyboard shortcut: Cmd/Ctrl + B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <SidebarContext.Provider
      value={{
        collapsed: mounted ? collapsed : false,
        toggle,
        setCollapsed,
        flyoutOpen,
        setFlyoutOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
