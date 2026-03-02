"use client";

import { useState } from "react";
import { 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  Hourglass, 
  PlayCircle, 
  CheckCircle2,
  Calendar,
  FileText,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid, StatCardCompact } from "./StatCard";
import type { ReportMetrics } from "../types";

interface ReportSummaryCardProps {
  metrics: ReportMetrics;
  csvFileName: string;
}

export function ReportSummaryCard({ metrics, csvFileName }: ReportSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const miguelOk = metrics.miguelPendingCount === 0;
  const descriptionsOk = metrics.aiAnalyzed && metrics.badDescriptions === 0;
  const observacionesOk = metrics.aiAnalyzed && metrics.badObservaciones === 0;

  const shareText = buildShareText(metrics);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formattedDate = formatDateLabel(metrics.date);

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">
                Reporte del {formattedDate}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate max-w-[250px] sm:max-w-md">{csvFileName}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 self-start rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar resumen</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main stats grid */}
        <StatGrid columns={3}>
          <StatCard
            icon={Clock}
            label="Preventivos pendientes"
            value={metrics.pendingPMs}
            variant="warning"
          />
          <StatCard
            icon={AlertTriangle}
            label="Preventivos atrasados"
            value={metrics.latePMs}
            subValue={metrics.latePMsDateRange || undefined}
            variant={metrics.latePMs > 0 ? "destructive" : "success"}
          />
          <StatCard
            icon={Hourglass}
            label="OT en Espera"
            value={metrics.waitingOTs}
            variant="info"
          />
          <StatCard
            icon={PlayCircle}
            label="OT en curso"
            value={metrics.inProgressOTs}
            variant="info"
          />
          <StatCard
            icon={CheckCircle2}
            label={`Terminadas (${metrics.completedYesterdayDate})`}
            value={metrics.completedYesterday}
            variant="success"
          />
          <StatCard
            icon={Sparkles}
            label="Total OTs"
            value={metrics.pendingPMs + metrics.waitingOTs + metrics.inProgressOTs + metrics.completedYesterday}
            variant="default"
          />
        </StatGrid>

        {/* Status section */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Estado del reporte
          </h3>
          
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <StatusBadge 
              status={miguelOk ? "success" : "warning"}
              label={miguelOk ? "Revisiones completadas" : `${metrics.miguelPendingCount} revisiones pendientes`}
              subLabel={!miguelOk ? `${metrics.miguelTotalReviewed} completadas` : undefined}
            />
            
            {!metrics.aiAnalyzed ? (
              <StatusBadge 
                status="pending"
                label="Análisis IA pendiente"
                subLabel="Pulsa Analizar con IA"
              />
            ) : (
              <>
                <StatusBadge 
                  status={descriptionsOk ? "success" : "error"}
                  label={descriptionsOk ? "Descripciones correctas" : `${metrics.badDescriptions} descripciones incompletas`}
                />
                <StatusBadge 
                  status={observacionesOk ? "success" : "error"}
                  label={observacionesOk ? "Observaciones correctas" : `${metrics.badObservaciones} observaciones incompletas`}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Status badge component
function StatusBadge({ 
  status, 
  label, 
  subLabel 
}: { 
  status: "success" | "warning" | "error" | "pending";
  label: string;
  subLabel?: string;
}) {
  const styles = {
    success: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    pending: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  };

  const icons = {
    success: <CheckCircle2 className="h-3.5 w-3.5" />,
    warning: <AlertTriangle className="h-3.5 w-3.5" />,
    error: <AlertTriangle className="h-3.5 w-3.5" />,
    pending: <Clock className="h-3.5 w-3.5" />,
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles[status]}`}>
      {icons[status]}
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        {subLabel && <span className="text-xs opacity-80">{subLabel}</span>}
      </div>
    </div>
  );
}

// Helper functions
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function buildShareText(metrics: ReportMetrics): string {
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
