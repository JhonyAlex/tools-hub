import { Wrench, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggleSimple } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
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

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>v1.0</span>
          </div>
          
          {/* Theme toggle */}
          <ThemeToggleSimple />
        </div>
      </div>
    </header>
  );
}
