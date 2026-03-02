"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            Reporte del {formatDateLabel(metrics.date)}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{csvFileName}</p>
        </div>
        <button
          onClick={handleCopy}
          title="Copiar para compartir"
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Metric rows */}
        <MetricRow
          emoji="⏰"
          label="Preventivos pendientes"
          value={metrics.pendingPMs}
          variant="warning"
        />
        <MetricRow
          emoji="⚠️"
          label="Preventivos atrasados"
          value={metrics.latePMs}
          sub={metrics.latePMsDateRange ? `${metrics.latePMsDateRange} 🔔` : undefined}
          variant={metrics.latePMs > 0 ? "destructive" : "default"}
        />
        <MetricRow
          emoji="🕒"
          label="OT en Espera"
          value={metrics.waitingOTs}
          variant="secondary"
        />
        <MetricRow
          emoji="➡️"
          label="OT en curso"
          value={metrics.inProgressOTs}
          variant="secondary"
        />
        <MetricRow
          emoji="✅"
          label={`OT terminadas (${metrics.completedYesterdayDate})`}
          value={metrics.completedYesterday}
          variant="success"
        />

        <div className="border-t border-border pt-2 mt-2 space-y-1.5">
          <StatusRow
            ok={miguelOk}
            label={
              miguelOk
                ? "Revisiones por Miguel registradas"
                : `Revisiones por Miguel: ${metrics.miguelTotalReviewed} ✔ · ${metrics.miguelPendingCount} pendientes`
            }
          />
          {!metrics.aiAnalyzed && (
            <StatusRow ok={null} label="Análisis IA pendiente (pulsa Analizar)" />
          )}
          {metrics.aiAnalyzed && (
            <>
              <StatusRow
                ok={descriptionsOk}
                label={
                  descriptionsOk
                    ? "Descripciones correctas (motivo de fallo)"
                    : `Descripciones: ${metrics.badDescriptions} incompleta(s)`
                }
              />
              <StatusRow
                ok={observacionesOk}
                label={
                  observacionesOk
                    ? "Observaciones correctas (como se solucionó)"
                    : `Observaciones: ${metrics.badObservaciones} incompleta(s)`
                }
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────

type Variant = "default" | "warning" | "destructive" | "secondary" | "success";

function MetricRow({
  emoji,
  label,
  value,
  sub,
  variant = "default",
}: {
  emoji: string;
  label: string;
  value: number;
  sub?: string;
  variant?: Variant;
}) {
  const colorMap: Record<Variant, string> = {
    default: "bg-muted text-foreground",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    secondary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-muted/40">
      <span className="text-sm flex items-center gap-2">
        <span role="img">{emoji}</span>
        <span>{label}</span>
        {sub && <span className="text-muted-foreground text-xs">({sub})</span>}
      </span>
      <span
        className={`min-w-[2rem] rounded-md px-2 py-0.5 text-center text-sm font-bold ${colorMap[variant]}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusRow({
  ok,
  label,
}: {
  ok: boolean | null;
  label: string;
}) {
  const icon =
    ok === null ? "⏳" : ok ? "✅" : "❌";
  const textColor =
    ok === null
      ? "text-muted-foreground"
      : ok
      ? "text-green-700 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className={`flex items-center gap-2 text-sm ${textColor}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatDateLabel(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildShareText(m: ReportMetrics): string {
  const lines: string[] = [];

  lines.push(`⏰ Preventivos pendientes: ${m.pendingPMs}`);

  const lateStr = m.latePMsDateRange ? ` (${m.latePMsDateRange}) 🔔` : "";
  lines.push(`⚠️ Preventivos atrasados: ${m.latePMs}${lateStr}`);

  lines.push(`🕒 OT en Espera: ${m.waitingOTs}`);
  lines.push(`➡️ OT en curso: ${m.inProgressOTs}`);
  lines.push(`✅ OT terminadas ${m.completedYesterdayDate}: ${m.completedYesterday}`);
  lines.push(``);

  if (m.aiAnalyzed) {
    const descOk = m.badDescriptions === 0;
    const obsOk = m.badObservaciones === 0;
    lines.push(
      `${descOk ? "✅" : "❌"} Descripciones correctas (Motivo de fallo, como se solucionó)`
    );
  } else {
    lines.push(`⏳ Descripciones correctas (Motivo de fallo, como se solucionó)`);
  }

  const miguelOk = m.miguelPendingCount === 0;
  lines.push(
    `${miguelOk ? "✅" : "❌"} Revisiones por Miguel registradas.`
  );

  return lines.join("\n");
}
