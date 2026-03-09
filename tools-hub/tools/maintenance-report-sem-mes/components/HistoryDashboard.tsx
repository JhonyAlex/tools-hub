"use client";

import { useState } from "react";
import { Trash2, Eye, Calendar, Clock, Hash, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/core/components/EmptyState";
import type { SavedSemMesReport } from "../types";
import { formatHours } from "../lib/timeParser";

interface HistoryDashboardProps {
  reports: SavedSemMesReport[];
  onDelete: (id: string) => void;
  onLoad: (report: SavedSemMesReport) => void;
}

export function HistoryDashboard({ reports, onDelete, onLoad }: HistoryDashboardProps) {
  const [filter, setFilter] = useState<"all" | "semanal" | "mensual" | "custom">("all");

  const filtered = reports.filter((r) => {
    if (filter === "all") return true;
    return r.periodType === filter;
  });

  if (reports.length === 0) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={Calendar}
          title="Sin reportes guardados"
          description="Genera y guarda un reporte para verlo aquí."
          size="md"
        />
      </Card>
    );
  }

  const periodLabel = (t: string) => {
    if (t === "semanal") return "Semanal";
    if (t === "mensual") return "Mensual";
    return "Custom";
  };

  const periodColor = (t: string) => {
    if (t === "semanal") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (t === "mensual") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "semanal", "mensual", "custom"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              filter === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f === "all" ? "Todos" : periodLabel(f)}
            {f !== "all" && (
              <span className="ml-1 opacity-60">
                ({reports.filter((r) => r.periodType === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {filtered.map((report) => {
          const rangeStart = new Date(report.dateRangeStart).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const rangeEnd = new Date(report.dateRangeEnd).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <Card key={report.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge className={cn("shrink-0 text-xs", periodColor(report.periodType))}>
                      {periodLabel(report.periodType)}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {rangeStart} - {rangeEnd}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {report.metrics.uniqueOTs} OTs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatHours(report.metrics.totalHours)}
                        </span>
                        <span className="text-xs">
                          {new Date(report.createdAt).toLocaleDateString("es-ES")}
                        </span>
                        {report.metrics.aiContent && (
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                            <Brain className="h-3 w-3" />
                            IA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => onLoad(report)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => onDelete(report.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
