"use client";

export const dynamic = "force-dynamic";

import { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Settings,
  Zap,
  History,
  Star,
  Sparkles,
  Search,
  LucideIcon,
} from "lucide-react";
import { getAllTools, getToolsByCategory, getToolBySlug, getCategories } from "@/core/registry";
import { ToolCard } from "@/core/components/ToolCard";
import { CategorySection, CategoryGrid } from "@/core/components/CategorySection";
import { EmptyState } from "@/core/components/EmptyState";
import { useFavorites } from "@/core/hooks/useFavorites";
import { useRecentTools } from "@/core/hooks/useRecentTools";
import type { ToolCategory, ToolManifest } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  generators: Zap,
  reports: BarChart3,
  utilities: Settings,
  communication: Sparkles,
  seo: Search,
  finance: Sparkles,
  design: Sparkles,
  development: Sparkles,
};

function resolveTools(slugs: string[]): ToolManifest[] {
  return slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolManifest => t !== undefined && t.status !== "hidden");
}

export default function DashboardHome() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") as ToolCategory | null;
  const filterType = searchParams.get("filter");

  const tools = getAllTools();
  const categories = getCategories();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentSlugs, trackVisit } = useRecentTools();

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof tools> = {};
    categories.forEach((cat) => {
      grouped[cat] = getToolsByCategory(cat);
    });
    return grouped;
  }, [categories]);

  const renderToolCard = useCallback(
    (tool: ToolManifest) => (
      <ToolCard
        key={tool.slug}
        tool={tool}
        isFavorite={isFavorite(tool.slug)}
        onToggleFavorite={toggleFavorite}
        onVisit={trackVisit}
      />
    ),
    [isFavorite, toggleFavorite, trackVisit]
  );

  // Filtered view by category
  if (categoryFilter) {
    const filteredTools = getToolsByCategory(categoryFilter);
    const Icon = CATEGORY_ICONS[categoryFilter] || Sparkles;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {CATEGORY_LABELS[categoryFilter]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {filteredTools.length} herramienta{filteredTools.length !== 1 ? "s" : ""} en esta categoría
          </p>
        </div>

        {filteredTools.length === 0 ? (
          <EmptyState
            icon={Icon}
            title="No hay herramientas"
            description="No se encontraron herramientas en esta categoría."
            size="md"
          />
        ) : (
          <CategoryGrid columns={3}>
            {filteredTools.map(renderToolCard)}
          </CategoryGrid>
        )}
      </div>
    );
  }

  // Recent / Favorites filter
  if (filterType === "recent" || filterType === "favorites") {
    const isRecent = filterType === "recent";
    const title = isRecent ? "Recientemente usadas" : "Favoritas";
    const description = isRecent
      ? "Herramientas que has utilizado recientemente."
      : "Tus herramientas marcadas como favoritas.";
    const Icon = isRecent ? History : Star;
    const resolvedTools = resolveTools(isRecent ? recentSlugs : favorites);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {resolvedTools.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={isRecent ? "Sin herramientas recientes" : "Sin favoritas"}
            description={
              isRecent
                ? "Aún no has visitado ninguna herramienta. Explora el panel para empezar."
                : "No tienes herramientas favoritas. Marca una con la estrella para acceder rápidamente."
            }
            size="lg"
          />
        ) : (
          <CategoryGrid columns={3}>
            {resolvedTools.map(renderToolCard)}
          </CategoryGrid>
        )}
      </div>
    );
  }

  // Default: Grouped by category
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/2 to-background p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-primary">Tools Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Panel de herramientas
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl text-base">
            Accede a todas las herramientas internas desde un solo lugar. Usa{" "}
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              ⌘K
            </kbd>{" "}
            para buscar rápidamente.
          </p>
        </div>
      </div>

      {/* Tools by Category */}
      <div className="space-y-6">
        {categories
          .filter((cat) => toolsByCategory[cat]?.length > 0)
          .map((category) => {
            const Icon = CATEGORY_ICONS[category] || Sparkles;
            const categoryTools = toolsByCategory[category];

            return (
              <CategorySection
                key={category}
                category={category}
                icon={Icon}
                count={categoryTools.length}
              >
                <CategoryGrid columns={3}>
                  {categoryTools.map(renderToolCard)}
                </CategoryGrid>
              </CategorySection>
            );
          })}
      </div>

      {/* Empty State */}
      {tools.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No hay herramientas"
          description="Agrega tu primera herramienta siguiendo las instrucciones en CONTRIBUTING.md"
          size="lg"
        />
      )}
    </div>
  );
}
