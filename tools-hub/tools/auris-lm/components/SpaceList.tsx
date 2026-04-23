"use client";
import { useState } from "react";
import { Plus, BookOpen, Trash2, Pencil, MoreVertical, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AurisSpace } from "../lib/useSpaces";

interface SpaceListProps {
  spaces: AurisSpace[];
  activeSpaceId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
  onEditClick: (space: AurisSpace) => void;
  onDeleteClick: (space: AurisSpace) => void;
}

export function SpaceList({
  spaces,
  activeSpaceId,
  loading,
  onSelect,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: SpaceListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Space list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <div className="space-y-3 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded-md bg-muted animate-pulse" />
                  <div className="h-2 w-1/3 rounded-md bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="px-2 py-8 text-center border-2 border-dashed border-border/50 rounded-xl mt-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <MessageSquare className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No hay espacios
            </p>
            <p className="text-xs text-muted-foreground mt-1 px-4 leading-relaxed">
              Crea uno para empezar a organizar tus documentos.
            </p>
            <Button variant="outline" size="sm" onClick={onCreateClick} className="mt-4 h-8 text-xs">
              <Plus className="mr-2 h-3 w-3" /> Crear espacio
            </Button>
          </div>
        ) : (
          spaces.map((space) => {
            const isActive = activeSpaceId === space.id;
            return (
              <div
                key={space.id}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors duration-200",
                  isActive
                    ? "bg-accent/80 text-foreground font-medium"
                    : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  onSelect(space.id);
                  setOpenMenuId(null);
                }}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive ? "bg-background shadow-sm text-primary" : "bg-muted/50 group-hover:bg-background group-hover:shadow-sm"
                )}>
                  <BookOpen className="size-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate leading-none mb-1">
                    {space.name}
                  </p>
                  <p className={cn(
                    "text-[10px] transition-colors",
                    isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                  )}>
                    {space._count?.documents ?? 0} documento{space._count?.documents !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Kebab menu button */}
                <button
                  className={cn(
                    "shrink-0 rounded-md p-1.5 transition-colors",
                    isActive ? "hover:bg-background shadow-sm" : "hover:bg-background shadow-sm",
                    openMenuId === space.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === space.id ? null : space.id);
                  }}
                >
                  <MoreVertical className={cn(
                    "size-3.5",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )} />
                </button>

                {/* Dropdown menu */}
                {openMenuId === space.id && (
                  <div
                    className="absolute right-2 top-11 z-30 min-w-[150px] rounded-lg border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      onClick={() => {
                        onEditClick(space);
                        setOpenMenuId(null);
                      }}
                    >
                      <Pencil className="size-3.5 text-blue-500" />
                      Renombrar
                    </button>
                    <div className="my-1 border-t" />
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => {
                        onDeleteClick(space);
                        setOpenMenuId(null);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Eliminar espacio
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
