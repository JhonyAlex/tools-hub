"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SavedReport } from "../types";
import { buildShareText } from "./ReportSummaryCard";

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

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No hay reportes guardados todavía.
        </CardContent>
      </Card>
    );
  }

  const sorted = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

  const handleCopy = (report: SavedReport) => {
    navigator.clipboard.writeText(buildShareText(report.metrics)).then(() => {
      setCopiedId(report.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {sorted.map((report) => {
        const isEditing = editingId === report.id;
        const dateLabel = new Date(report.reportDate).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return (
          <Card key={report.id} className="group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-semibold capitalize">
                    {dateLabel}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{report.csvFileName}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <MetricBadge emoji="⏰" value={report.metrics.pendingPMs} color="yellow" />
                  <MetricBadge emoji="⚠️" value={report.metrics.latePMs} color="red" />
                  <MetricBadge emoji="✅" value={report.metrics.completedYesterday} color="green" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Notes */}
              {isEditing ? (
                <div className="flex items-start gap-2">
                  <textarea
                    className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Añade notas a este reporte..."
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      className="rounded-md p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      onClick={() => {
                        onUpdateNotes(report.id, editNotes);
                        setEditingId(null);
                      }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground min-h-[1.5rem]">
                  {report.notes || (
                    <span className="italic">Sin notas. Pulsa ✏️ para añadir.</span>
                  )}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onLoad(report)}
                  className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  Ver detalles
                </button>
                <button
                  onClick={() => handleCopy(report)}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Copiar para compartir"
                >
                  {copiedId === report.id ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingId(report.id);
                    setEditNotes(report.notes ?? "");
                  }}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Editar notas"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este reporte?")) onDelete(report.id);
                  }}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MetricBadge({
  emoji,
  value,
  color,
}: {
  emoji: string;
  value: number;
  color: "yellow" | "red" | "green" | "blue";
}) {
  const cls = {
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  }[color];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {emoji} {value}
    </span>
  );
}
