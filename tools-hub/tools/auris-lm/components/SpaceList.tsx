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
    <div className="flex flex-col h-full bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Mis Espacios
        </h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCreateClick}
          className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
          title="Crear nuevo espacio"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Space list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="space-y-3 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No hay espacios
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Crea uno para empezar a organizar tus documentos.
            </p>
          </div>
        ) : (
          spaces.map((space) => {
            const isActive = activeSpaceId === space.id;
            return (
              <div
                key={space.id}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "hover:bg-accent/80 text-foreground"
                )}
                onClick={() => {
                  onSelect(space.id);
                  setOpenMenuId(null);
                }}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"
                )}>
                  <BookOpen className="size-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-none mb-1">
                    {space.name}
                  </p>
                  <p className={cn(
                    "text-[10px] transition-colors",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {space._count?.documents ?? 0} documento{space._count?.documents !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Kebab menu button */}
                <button
                  className={cn(
                    "shrink-0 rounded-md p-1 transition-all",
                    isActive ? "hover:bg-white/20" : "hover:bg-accent",
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
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )} />
                </button>

                {/* Dropdown menu */}
                {openMenuId === space.id && (
                  <div
                    className="absolute right-2 top-11 z-30 min-w-[150px] rounded-xl border bg-popover p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-accent transition-colors"
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
