"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck,
  Search,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MiguelCheckResult } from "../types";

interface MiguelPanelProps {
  reviewed: number;
  pending: MiguelCheckResult[];
}

export function MiguelPanel({ reviewed, pending }: MiguelPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allOk = pending.length === 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      allOk ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              allOk 
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Revisiones por Miguel</h3>
              <p className="text-sm text-muted-foreground">
                {allOk 
                  ? "Todas las OTs han sido revisadas"
                  : `${pending.length} OTs pendientes de revisión`
                }
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/20 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {reviewed}
              </span>
            </div>
            {!allOk && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 px-3 py-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {pending.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expandable content */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <CardContent className="pt-0">
            {pending.length > 0 ? (
              <div className="space-y-3">
                {/* Toggle button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Ocultar detalles
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver {pending.length} OTs sin revisión
                    </>
                  )}
                </button>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-3.5 w-3.5" />
                              OT
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            Descripción
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Search className="h-3.5 w-3.5" />
                              Observaciones actuales
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pending.map((r, index) => (
                          <tr 
                            key={r.ordenDeTrabajo}
                            className="hover:bg-muted/30 transition-colors animate-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 py-3">
                              <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                                {r.ordenDeTrabajo}
                              </code>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className="truncate text-sm" title={r.descripcion}>
                                {r.descripcion || "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3 max-w-[250px]">
                              {r.observaciones ? (
                                <p className="truncate text-sm text-muted-foreground" title={r.observaciones}>
                                  {r.observaciones}
                                </p>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                  <AlertCircle className="h-3 w-3" />
                                  Sin observaciones
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">¡Todas las revisiones están completas!</span>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Show/hide button when there are pending items */}
      {pending.length > 0 && (
        <CardContent className="pt-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all",
              isOpen
                ? "border-border bg-muted/50 hover:bg-muted text-muted-foreground"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
            )}
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar lista de OTs pendientes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver {pending.length} OTs sin revisión de Miguel
              </>
            )}
          </button>
        </CardContent>
      )}
    </Card>
  );
}
