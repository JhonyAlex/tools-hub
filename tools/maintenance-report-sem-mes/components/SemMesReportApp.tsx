"use client";

import { useCallback, useRef, useState } from "react";
import {
  Brain,
  Save,
  CalendarRange,
  History,
  RefreshCw,
  HardDrive,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { parseCSV } from "../lib/csvParser";
import { calculateReport } from "../lib/reportCalculator";
import { useReportsStorage } from "../lib/useReportsStorage";
import { useCopyReport } from "../lib/useCopyReport";
import type {
  LaborRecord,
  ReportAggregations,
  AIReportContent,
  PeriodType,
  DateRange,
  SavedSemMesReport,
  SemMesReportMetrics,
} from "../types";

import { UploadSection, UploadError } from "./UploadSection";
import { PeriodSelector } from "./PeriodSelector";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { AssetAnalysis } from "./AssetAnalysis";
import { OTTypeAnalysis } from "./OTTypeAnalysis";
import { WorkerAnalysis } from "./WorkerAnalysis";
import { ConclusionsPanel } from "./ConclusionsPanel";
import { ReportContainer } from "./ReportContainer";
import { HistoryDashboard } from "./HistoryDashboard";
import { HistoryCharts } from "./HistoryCharts";

type Tab = "analyze" | "history";

export function SemMesReportApp() {
  const [tab, setTab] = useState<Tab>("analyze");

  // Storage
  const {
    reports: savedReports,
    loading: loadingReports,
    usingLocalStorage,
    fetchReports,
    saveReport,
    deleteReport,
  } = useReportsStorage();

  // CSV state
  const [csvFileName, setCsvFileName] = useState("");
  const [records, setRecords] = useState<LaborRecord[]>([]);
  const [isParsingCSV, setIsParsingCSV] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Period state
  const [periodType, setPeriodType] = useState<PeriodType>("semanal");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Report state
  const [aggregations, setAggregations] = useState<ReportAggregations | null>(null);
  const [aiContent, setAiContent] = useState<AIReportContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Copy report
  const reportRef = useRef<HTMLDivElement>(null);
  const { copyAll, copying, copied } = useCopyReport(reportRef);

  // ──────────────────────────────────────────
  // Period change
  // ──────────────────────────────────────────
  const handlePeriodChange = useCallback(
    (pt: PeriodType, dr: DateRange) => {
      setPeriodType(pt);
      setDateRange(dr);
      setAiContent(null);
      // Recalculate if records exist
      if (records.length > 0) {
        const agg = calculateReport(records, dr, pt);
        setAggregations(agg);
      }
    },
    [records]
  );

  // ──────────────────────────────────────────
  // CSV upload
  // ──────────────────────────────────────────
  const handleFile = useCallback(
    (content: string, fileName: string) => {
      setIsParsingCSV(true);
      setError(null);
      setAiContent(null);
      try {
        const parsed = parseCSV(content);
        setRecords(parsed);
        setCsvFileName(fileName);

        if (dateRange) {
          const agg = calculateReport(parsed, dateRange, periodType);
          setAggregations(agg);
        }
      } catch (e) {
        setError(`Error al parsear CSV: ${String(e)}`);
      } finally {
        setIsParsingCSV(false);
      }
    },
    [dateRange, periodType]
  );

  // ──────────────────────────────────────────
  // AI Analysis
  // ──────────────────────────────────────────
  const handleAIAnalysis = async () => {
    if (!aggregations) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/maintenance-report-sem-mes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aggregations }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setAiContent(data.aiContent);
    } catch (e) {
      setError(`Error en análisis IA: ${String(e)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ──────────────────────────────────────────
  // Save report
  // ──────────────────────────────────────────
  const handleSave = async () => {
    if (!aggregations || !dateRange) return;
    setIsSaving(true);
    try {
      const metrics: SemMesReportMetrics = {
        generatedAt: new Date().toISOString(),
        periodType,
        dateRangeStart: dateRange.start.toISOString(),
        dateRangeEnd: dateRange.end.toISOString(),
        totalOTs: aggregations.totalOTs,
        uniqueOTs: aggregations.uniqueOTs,
        totalHours: aggregations.totalHours,
        assets: aggregations.assets,
        otTypes: aggregations.otTypes,
        workers: aggregations.workers,
        aiContent,
      };

      await saveReport(
        periodType,
        dateRange.start.toISOString(),
        dateRange.end.toISOString(),
        csvFileName,
        metrics
      );
    } catch (e) {
      setError(`Error al guardar: ${String(e)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────
  // Load saved report
  // ──────────────────────────────────────────
  const handleLoadReport = (report: SavedSemMesReport) => {
    const m = report.metrics;
    setCsvFileName(report.csvFileName);
    setAiContent(m.aiContent);
    setPeriodType(m.periodType);
    setDateRange({
      start: new Date(m.dateRangeStart),
      end: new Date(m.dateRangeEnd),
    });
    setAggregations({
      totalOTs: m.totalOTs,
      uniqueOTs: m.uniqueOTs,
      totalHours: m.totalHours,
      assets: m.assets,
      otTypes: m.otTypes,
      workers: m.workers,
      periodType: m.periodType,
      dateRange: {
        start: new Date(m.dateRangeStart),
        end: new Date(m.dateRangeEnd),
      },
      filteredRecords: m.totalOTs,
    });
    setRecords([]);
    setTab("analyze");
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <CalendarRange className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reporte Semanal/Mensual</h1>
            <p className="text-sm text-muted-foreground">
              Mano de obra · Análisis por período
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
          <TabButton
            label="Nuevo informe"
            icon={<CalendarRange className="h-4 w-4" />}
            active={tab === "analyze"}
            onClick={() => setTab("analyze")}
          />
          <TabButton
            label="Historial"
            icon={<History className="h-4 w-4" />}
            active={tab === "history"}
            onClick={() => setTab("history")}
            badge={savedReports.length > 0 ? savedReports.length : undefined}
          />
        </div>
      </div>

      {/* localStorage notice */}
      {usingLocalStorage && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <HardDrive className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Modo sin base de datos</p>
            <p className="text-xs opacity-90 mt-0.5">
              Los reportes se guardan en el navegador (localStorage).
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB: Nuevo informe ─── */}
      {tab === "analyze" && (
        <div className="space-y-6">
          {/* Period selector */}
          <PeriodSelector onPeriodChange={handlePeriodChange} />

          {/* Upload */}
          <UploadSection onFile={handleFile} isLoading={isParsingCSV} />

          {/* Error */}
          {error && (
            <UploadError message={error} onRetry={() => setError(null)} />
          )}

          {/* Results */}
          {aggregations && aggregations.filteredRecords > 0 && (
            <div className="space-y-6 animate-slide-up">
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {!aiContent && (
                  <Button
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30"
                  >
                    <Brain className="h-4 w-4" />
                    {isAnalyzing ? "Analizando con IA..." : "Analizar con IA"}
                  </Button>
                )}
                {aiContent && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-3 py-1.5 text-sm border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Análisis IA completado
                  </Badge>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="outline"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Guardando..." : "Guardar reporte"}
                </Button>
              </div>

              {/* Report container (copyable) */}
              <ReportContainer
                ref={reportRef}
                onCopy={copyAll}
                copying={copying}
                copied={copied}
              >
                <ExecutiveSummary
                  aggregations={aggregations}
                  aiContent={aiContent}
                />
                <AssetAnalysis assets={aggregations.assets} />
                <OTTypeAnalysis otTypes={aggregations.otTypes} />
                <WorkerAnalysis workers={aggregations.workers} />
                {aiContent && <ConclusionsPanel aiContent={aiContent} />}
              </ReportContainer>
            </div>
          )}

          {/* No results for period */}
          {aggregations && aggregations.filteredRecords === 0 && records.length > 0 && (
            <Card className="border-dashed border-amber-300 dark:border-amber-700">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <CalendarRange className="h-12 w-12 text-amber-400 mb-3" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Sin registros en este período
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                    No se encontraron registros con &quot;Fecha de Fin&quot; dentro del rango
                    seleccionado. Prueba con otro período o fechas personalizadas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!aggregations && !isParsingCSV && !error && (
            <Card className="border-dashed">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Selecciona período y sube el CSV
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                    Primero elige el tipo de informe (semanal/mensual), luego sube
                    el archivo de Mano de Obra de Primavera
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: Historial ─── */}
      {tab === "history" && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Reportes guardados</h2>
                <p className="text-sm text-muted-foreground">
                  {savedReports.length}{" "}
                  {savedReports.length === 1 ? "reporte" : "reportes"} en total
                </p>
              </div>
            </div>
            <Button
              onClick={fetchReports}
              disabled={loadingReports}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", loadingReports && "animate-spin")}
              />
              Actualizar
            </Button>
          </div>

          <HistoryCharts reports={savedReports} />

          <HistoryDashboard
            reports={savedReports}
            onDelete={deleteReport}
            onLoad={handleLoadReport}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Tab button
// ──────────────────────────────────────────
interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function TabButton({ label, icon, active, onClick, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "ml-1 rounded-full px-2 py-0.5 text-xs",
            active
              ? "bg-primary-foreground/20"
              : "bg-muted text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
