"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
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
import { getCategoryStyle } from "@/core/styles/category-styles";
import { useState } from "react";
import { userButtonAppearance } from "@/core/lib/clerk-appearance";

export function Header() {
  const { toolInfo } = useToolInfo();
  const categories = getCategories();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Left section: Mobile menu + Logo */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
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

          {/* Logo - Always visible */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
              <Wrench className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-base font-bold leading-tight">Tools Hub</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Panel de herramientas
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Tool Title or Command Bar */}
        <div className="flex-1 flex justify-center min-w-0">
          {toolInfo ? (
            <div className="flex flex-col items-center text-center min-w-0 max-w-full">
              <div className="flex items-center gap-2 min-w-0">
                {toolInfo.icon && (
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg border shrink-0",
                      toolInfo.category
                        ? cn(getCategoryStyle(toolInfo.category).bg, getCategoryStyle(toolInfo.category).border)
                        : "bg-primary/10"
                    )}
                  >
                    <toolInfo.icon
                      className={cn(
                        "h-3.5 w-3.5",
                        toolInfo.category
                          ? getCategoryStyle(toolInfo.category).text
                          : "text-primary"
                      )}
                    />
                  </div>
                )}
                <h1 className="text-base font-semibold tracking-tight truncate">
                  {toolInfo.title}
                </h1>
                {toolInfo.beta && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1.5 py-0 shrink-0"
                  >
                    Beta
                  </Badge>
                )}
              </div>
              {toolInfo.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[300px] lg:max-w-[500px]">
                  {toolInfo.description}
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-xl hidden md:block">
              <CommandBar className="w-full" />
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Command Bar - Show when tool is active */}
          {toolInfo && (
            <div className="hidden lg:block w-64">
              <CommandBar className="w-full" />
            </div>
          )}

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

          <SignedIn>
            <div className="flex items-center">
              <UserButton
                appearance={userButtonAppearance}
                afterSwitchSessionUrl="/"
                userProfileMode="modal"
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="hidden sm:flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="h-9 rounded-lg">
                  Iniciar sesion
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="h-9 rounded-lg">
                  Registrarse
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
