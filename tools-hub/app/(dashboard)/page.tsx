"use client";

import { useState } from "react";
import { getAllTools, searchTools } from "@/core/registry";
import { ToolCard } from "@/core/components/ToolCard";
import { SearchBar } from "@/core/components/SearchBar";

export default function DashboardHome() {
  const [query, setQuery] = useState("");
  const tools = query ? searchTools(query) : getAllTools();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tools Hub</h1>
        <p className="mt-1 text-muted-foreground">
          Panel central de herramientas internas
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} />

      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No hay herramientas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? "No se encontraron herramientas con esa busqueda."
              : "Agrega tu primera herramienta siguiendo las instrucciones en CONTRIBUTING.md"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
