"use client";

import { useState } from "react";
import { 
  Trash2, 
  Pencil, 
  Check, 
  X, 
  Copy, 
  FileText,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SavedReport } from "../types";
import { EmptyState } from "@/core/components/EmptyState";

interface SavedReportsListProps {
  reports: SavedReport[];
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onLoad: (report: SavedReport) => void;
}

export function SavedReportsList({
  reports,
  onDelete,
  onUpdateNotes,
  onLoad,
}: SavedReportsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={History}
          title="No hay reportes guardados"
          description="Sube un archivo CSV y guarda el reporte para verlo aquí."
          size="md"
        />
      </Card>
    );
  }

  const sorted = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

  const handleCopy = async (report: SavedReport) => {
    const text = buildShareText(report.metrics);
    await navigator.clipboard.writeText(text);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 200);
  };

  return (
    <div className="space-y-4">
      {sorted.map((report, index) => {
        const isEditing = editingId === report.id;
        const isCopied = copiedId === report.id;
        const isDeleting = deletingId === report.id;
        
        const dateLabel = new Date(report.reportDate).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const hasLate = report.metrics.latePMs > 0;
        const hasPendingMiguel = report.metrics.miguelPendingCount > 0;
        const hasAIErrors = report.metrics.aiAnalyzed && 
          (report.metrics.badDescriptions > 0 || report.metrics.badObservaciones > 0);

        return (
          <Card 
            key={report.id} 
            className={cn(
              "group overflow-hidden transition-all duration-200 hover:shadow-md",
              isDeleting && "opacity-50 scale-95"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold capitalize">{dateLabel}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    {report.csvFileName}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(report)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                      isCopied
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : "border-border bg-background hover:bg-accent"
                    )}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onLoad(report)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
                  >
                    <span>Ver</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Metrics badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <MetricBadge 
                  icon="⏰" 
                  value={report.metrics.pendingPMs} 
                  label="Pendientes"
                  color="yellow" 
                />
                <MetricBadge 
                  icon="⚠️" 
                  value={report.metrics.latePMs} 
                  label="Atrasados"
                  color={hasLate ? "red" : "green"} 
                />
                <MetricBadge 
                  icon="✅" 
                  value={report.metrics.completedYesterday} 
                  label="Terminadas"
                  color="green" 
                />
                {hasPendingMiguel && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                    👤 {report.metrics.miguelPendingCount} sin Miguel
                  </Badge>
                )}
                {hasAIErrors && (
                  <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20">
                    🤖 {report.metrics.badDescriptions + report.metrics.badObservaciones} errores IA
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Notes section */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Añade notas a este reporte..."
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      onClick={() => {
                        onUpdateNotes(report.id, editNotes);
                        setEditingId(null);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {report.notes ? (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {report.notes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Sin notas añadidas
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={() => {
                        setEditingId(report.id);
                        setEditNotes(report.notes || "");
                      }}
                      title="Editar notas"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(report.id)}
                      title="Eliminar reporte"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Metric badge component
function MetricBadge({ 
  icon, 
  value, 
  label,
  color 
}: { 
  icon: string; 
  value: number; 
  label: string;
  color: "yellow" | "red" | "green";
}) {
  const colorStyles = {
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colorStyles[color]}`}>
      <span>{icon}</span>
      <span>{value} {label}</span>
    </div>
  );
}

// Helper function (copied from ReportSummaryCard)
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function buildShareText(metrics: { date: string; pendingPMs: number; latePMs: number; latePMsDateRange: string | null; waitingOTs: number; inProgressOTs: number; completedYesterday: number; completedYesterdayDate: string; miguelPendingCount: number; aiAnalyzed: boolean; badDescriptions: number; badObservaciones: number }): string {
  const parts: string[] = [];
  parts.push(`📊 Reporte del ${formatDateLabel(metrics.date)}`);
  parts.push("");
  parts.push(`⏰ Preventivos pendientes: ${metrics.pendingPMs}`);
  if (metrics.latePMs > 0) {
    parts.push(`⚠️ Preventivos atrasados: ${metrics.latePMs}${metrics.latePMsDateRange ? ` (${metrics.latePMsDateRange})` : ""}`);
  }
  parts.push(`🕒 OT en Espera: ${metrics.waitingOTs}`);
  parts.push(`➡️ OT en curso: ${metrics.inProgressOTs}`);
  parts.push(`✅ OT terminadas (${metrics.completedYesterdayDate}): ${metrics.completedYesterday}`);

  if (metrics.miguelPendingCount > 0) {
    parts.push("");
    parts.push(`⚠️ ${metrics.miguelPendingCount} OTs sin revisión de Miguel`);
  }

  if (metrics.aiAnalyzed) {
    if (metrics.badDescriptions > 0 || metrics.badObservaciones > 0) {
      parts.push("");
      if (metrics.badDescriptions > 0) {
        parts.push(`📝 ${metrics.badDescriptions} descripción(es) incompleta(s)`);
      }
      if (metrics.badObservaciones > 0) {
        parts.push(`💬 ${metrics.badObservaciones} observacion(es) incompleta(s)`);
      }
    }
  }

  return parts.join("\n");
}
