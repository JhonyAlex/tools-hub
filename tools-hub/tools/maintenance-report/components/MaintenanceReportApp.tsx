"use client";

import { useCallback, useState } from "react";
import { 
  Brain, 
  Save, 
  BarChart2, 
  History, 
  RefreshCw, 
  AlertTriangle, 
  HardDrive,
  Sparkles,
  FileText,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { parseCSV } from "../lib/csvParser";
import { calculateMetrics } from "../lib/reportCalculator";
import { useReportsStorage } from "../lib/useReportsStorage";
import type { OTRecord, ReportMetrics, SavedReport, AIAnalysisResult } from "../types";

import { UploadSection, UploadError } from "./UploadSection";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { AIDescriptionsPanel } from "./AIDescriptionsPanel";
import { MiguelPanel } from "./MiguelPanel";
import { HistoryChart } from "./HistoryChart";
import { SavedReportsList } from "./SavedReportsList";
import { StatCard } from "./StatCard";

type Tab = "analyze" | "history";

export function MaintenanceReportApp() {
  const [tab, setTab] = useState<Tab>("analyze");

  // Storage (DB when available, localStorage fallback)
  const {
    reports: savedReports,
    loading: loadingReports,
    usingLocalStorage,
    fetchReports,
    saveReport,
    deleteReport,
    updateNotes: updateReportNotes,
  } = useReportsStorage();

  // CSV / analysis state
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [records, setRecords] = useState<OTRecord[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [isParsingCSV, setIsParsingCSV] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Late preventives list toggle
  const [showLateList, setShowLateList] = useState(false);

  // ──────────────────────────────────────────
  // CSV Upload handler
  // ──────────────────────────────────────────
  const handleFile = useCallback((content: string, fileName: string) => {
    setIsParsingCSV(true);
    setAnalyzeError(null);
    try {
      const parsed = parseCSV(content);
      const calc = calculateMetrics(parsed);
      const fullMetrics: ReportMetrics = {
        ...calc,
        aiAnalyzed: false,
        aiResults: [],
        badDescriptions: 0,
        badObservaciones: 0,
      };
      setRecords(parsed);
      setCsvFileName(fileName);
      setMetrics(fullMetrics);
    } catch (e) {
      setAnalyzeError(`Error al parsear CSV: ${String(e)}`);
    } finally {
      setIsParsingCSV(false);
    }
  }, []);

  // ──────────────────────────────────────────
  // AI Analysis
  // ──────────────────────────────────────────
  const handleAIAnalysis = async () => {
    if (!metrics || records.length === 0) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/maintenance-report/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      const aiResults: AIAnalysisResult[] = data.results ?? [];
      const badDescriptions = aiResults.filter((r) => r.descripcionScore === "bad").length;
      const badObservaciones = aiResults.filter((r) => r.observacionesScore === "bad").length;

      setMetrics((prev) =>
        prev
          ? { ...prev, aiAnalyzed: true, aiResults, badDescriptions, badObservaciones }
          : prev
      );
    } catch (e) {
      setAnalyzeError(`Error en análisis IA: ${String(e)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ──────────────────────────────────────────
  // Save report
  // ──────────────────────────────────────────
  const handleSave = async () => {
    if (!metrics) return;
    setIsSaving(true);
    try {
      await saveReport(metrics.date, csvFileName, metrics, "");
      // Show success toast or notification
    } catch (e) {
      setAnalyzeError(`Error al guardar: ${String(e)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────
  // Delete saved report
  // ──────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await deleteReport(id);
  };

  // ──────────────────────────────────────────
  // Update notes
  // ──────────────────────────────────────────
  const handleUpdateNotes = async (id: string, notes: string) => {
    await updateReportNotes(id, notes);
  };

  // ──────────────────────────────────────────
  // Load saved report into view
  // ──────────────────────────────────────────
  const handleLoadReport = (report: SavedReport) => {
    setCsvFileName(report.csvFileName);
    setMetrics(report.metrics);
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
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reporte de Mantenimiento</h1>
            <p className="text-sm text-muted-foreground">
              Analiza y gestiona las órdenes de trabajo
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
          <TabButton
            label="Nuevo análisis"
            icon={<BarChart2 className="h-4 w-4" />}
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
              Los reportes se guardan en el navegador (localStorage). Para persistencia permanente configura <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">DATABASE_URL</code> en el entorno.
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB: Nuevo análisis ─── */}
      {tab === "analyze" && (
        <div className="space-y-6">
          {/* Upload */}
          <UploadSection onFile={handleFile} isLoading={isParsingCSV} />

          {/* Error */}
          {analyzeError && (
            <UploadError 
              message={analyzeError} 
              onRetry={() => setAnalyzeError(null)}
            />
          )}

          {/* Results */}
          {metrics && (
            <div className="space-y-6 animate-slide-up">
              <ReportSummaryCard metrics={metrics} csvFileName={csvFileName} />

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {records.length > 0 && !metrics.aiAnalyzed && (
                  <Button
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30"
                  >
                    <Brain className="h-4 w-4" />
                    {isAnalyzing ? "Analizando con IA..." : "Analizar con IA"}
                  </Button>
                )}
                
                {metrics.aiAnalyzed && (
                  <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
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

              {/* Miguel panel */}
              <MiguelPanel
                reviewed={metrics.miguelTotalReviewed}
                pending={metrics.miguelPendingList}
              />

              {/* Late preventives detail */}
              {metrics.latePMs > 0 && (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardContent className="pt-6 space-y-4">
                    <button
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setShowLateList((v) => !v)}
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      {showLateList ? "Ocultar" : "Ver"} detalle de {metrics.latePMs} preventivos atrasados
                      <ChevronRight className={cn("h-4 w-4 transition-transform", showLateList && "rotate-90")} />
                    </button>
                    
                    <div className={cn(
                      "grid transition-all duration-300",
                      showLateList ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}>
                      <div className="overflow-hidden">
                        <div className="overflow-hidden rounded-lg border border-border">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">OT</th>
                                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
                                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Creación</th>
                                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Días hábiles</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {metrics.latePreventivesList.map((l) => (
                                  <tr key={l.ordenDeTrabajo} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                                        {l.ordenDeTrabajo}
                                      </code>
                                    </td>
                                    <td className="px-4 py-3 max-w-[220px] truncate" title={l.descripcion}>
                                      {l.descripcion}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{l.fecha}</td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                        {l.diasHabiles} días
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI results */}
              {metrics.aiAnalyzed && metrics.aiResults.length > 0 && (
                <AIDescriptionsPanel results={metrics.aiResults} />
              )}
            </div>
          )}

          {/* Empty state when no metrics */}
          {!metrics && !isParsingCSV && !analyzeError && (
            <Card className="border-dashed">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Sube un archivo CSV para comenzar
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                    Arrastra el archivo de exportación de Primavera o selecciónalo manualmente
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
                  {savedReports.length} {savedReports.length === 1 ? "reporte" : "reportes"} en total
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
              <RefreshCw className={cn("h-4 w-4", loadingReports && "animate-spin")} />
              Actualizar
            </Button>
          </div>

          <HistoryChart reports={savedReports} />

          <SavedReportsList
            reports={savedReports}
            onDelete={handleDelete}
            onUpdateNotes={handleUpdateNotes}
            onLoad={handleLoadReport}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Sub-components
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
        <span className={cn(
          "ml-1 rounded-full px-2 py-0.5 text-xs",
          active
            ? "bg-primary-foreground/20"
            : "bg-muted text-muted-foreground"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
