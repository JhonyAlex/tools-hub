"use client";

import { FileText, Clock, Wrench, Hash } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AIReportContent, ReportAggregations } from "../types";
import { formatHours } from "../lib/timeParser";
import { formatDateRange } from "../lib/dateUtils";

interface ExecutiveSummaryProps {
  aggregations: ReportAggregations;
  aiContent: AIReportContent | null;
}

export function ExecutiveSummary({ aggregations, aiContent }: ExecutiveSummaryProps) {
  const periodLabel =
    aggregations.periodType === "semanal"
      ? "Semanal"
      : aggregations.periodType === "mensual"
        ? "Mensual"
        : "Personalizado";

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatMini
          icon={Hash}
          label="OTs únicas"
          value={aggregations.uniqueOTs}
          color="blue"
        />
        <StatMini
          icon={FileText}
          label="Registros"
          value={aggregations.filteredRecords}
          color="purple"
        />
        <StatMini
          icon={Clock}
          label="Horas totales"
          value={formatHours(aggregations.totalHours)}
          color="amber"
        />
        <StatMini
          icon={Wrench}
          label="Período"
          value={periodLabel}
          color="green"
        />
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {formatDateRange(aggregations.dateRange.start, aggregations.dateRange.end)}
      </div>

      {/* AI Summary */}
      {aiContent && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg">Resumen Ejecutivo</h3>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {aiContent.executiveSummary.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!aiContent && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground text-center">
              Ejecuta el análisis IA para generar el resumen ejecutivo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Hash;
  label: string;
  value: string | number;
  color: "blue" | "purple" | "amber" | "green";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-1">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${colorMap[color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
