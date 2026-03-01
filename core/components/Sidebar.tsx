"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/core/types/tool.types";
import type { ToolCategory } from "@/core/types/tool.types";

interface SidebarProps {
  categories: ToolCategory[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  generators: <FolderOpen className="h-4 w-4" />,
  reports: <FolderOpen className="h-4 w-4" />,
  utilities: <FolderOpen className="h-4 w-4" />,
  communication: <FolderOpen className="h-4 w-4" />,
  seo: <FolderOpen className="h-4 w-4" />,
  finance: <FolderOpen className="h-4 w-4" />,
  design: <FolderOpen className="h-4 w-4" />,
  development: <FolderOpen className="h-4 w-4" />,
};

export function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-muted/30 md:block">
      <nav className="flex flex-col gap-1 p-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
            pathname === "/" && "bg-accent"
          )}
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>

        {categories.length > 0 && (
          <>
            <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Categorias
            </div>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${cat}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                )}
              >
                {CATEGORY_ICONS[cat]}
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
