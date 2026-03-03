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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Espacios</span>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onCreateClick}
          title="Crear nuevo espacio"
        >
          <Plus />
        </Button>
      </div>

      {/* Space list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="space-y-2 px-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <MessageSquare className="size-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Sin espacios aún.
              <br />
              Crea uno con el botón{" "}
              <span className="font-semibold">+</span>
            </p>
          </div>
        ) : (
          spaces.map((space) => (
            <div
              key={space.id}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                activeSpaceId === space.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent text-foreground"
              )}
              onClick={() => {
                onSelect(space.id);
                setOpenMenuId(null);
              }}
            >
              <BookOpen className="size-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{space.name}</p>
                <p className="text-xs text-muted-foreground">
                  {space._count?.documents ?? 0} docs
                </p>
              </div>

              {/* Kebab menu button */}
              <button
                className={cn(
                  "shrink-0 rounded p-0.5 transition-opacity",
                  openMenuId === space.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === space.id ? null : space.id);
                }}
              >
                <MoreVertical className="size-3.5 text-muted-foreground" />
              </button>

              {/* Dropdown menu */}
              {openMenuId === space.id && (
                <div
                  className="absolute right-1 top-8 z-20 min-w-[140px] rounded-lg border bg-popover text-popover-foreground shadow-lg p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      onEditClick(space);
                      setOpenMenuId(null);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Renombrar
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onDeleteClick(space);
                      setOpenMenuId(null);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
