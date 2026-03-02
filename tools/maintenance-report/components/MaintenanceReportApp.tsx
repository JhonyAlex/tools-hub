"use client";

import { useCallback, useState } from "react";
import { Brain, Save, BarChart2, History, RefreshCw, AlertTriangle, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { parseCSV } from "../lib/csvParser";
import { calculateMetrics } from "../lib/reportCalculator";
import { useReportsStorage } from "../lib/useReportsStorage";
import type { OTRecord, ReportMetrics, SavedReport, AIAnalysisResult } from "../types";

import { UploadSection } from "./UploadSection";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { AIDescriptionsPanel } from "./AIDescriptionsPanel";
import { MiguelPanel } from "./MiguelPanel";
import { HistoryChart } from "./HistoryChart";
import { SavedReportsList } from "./SavedReportsList";

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
      alert("✅ Reporte guardado correctamente.");
    } catch (e) {
      alert(`Error al guardar: ${String(e)}`);
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
    <div className="space-y-5">
      {/* TABS */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
        <TabBtn label="Nuevo análisis" icon={<BarChart2 size={15} />} active={tab === "analyze"} onClick={() => setTab("analyze")} />
        <TabBtn
          label={`Historial${savedReports.length > 0 ? ` (${savedReports.length})` : ""}`}
          icon={<History size={15} />}
          active={tab === "history"}
          onClick={() => setTab("history")}
        />
      </div>

      {/* localStorage notice */}
      {usingLocalStorage && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50/60 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <HardDrive size={13} className="shrink-0" />
          <span>
            <strong>Modo sin base de datos:</strong> los reportes se guardan en el navegador (localStorage). Para persistencia permanente configura <code className="font-mono">DATABASE_URL</code> en el entorno.
          </span>
        </div>
      )}

      {/* ─── TAB: Nuevo análisis ─── */}
      {tab === "analyze" && (
        <div className="space-y-5">
          {/* Upload */}
          <UploadSection onFile={handleFile} isLoading={isParsingCSV} />

          {/* Error */}
          {analyzeError && (
            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10">
              <CardContent className="flex items-start gap-2 pt-4 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {analyzeError}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {metrics && (
            <>
              <ReportSummaryCard metrics={metrics} csvFileName={csvFileName} />

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {records.length > 0 && (
                  <button
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Brain size={15} />
                    {isAnalyzing ? "Analizando con IA…" : "Analizar con IA"}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  <Save size={15} />
                  {isSaving ? "Guardando…" : "Guardar reporte"}
                </button>
              </div>

              {/* Miguel panel */}
              <MiguelPanel
                reviewed={metrics.miguelTotalReviewed}
                pending={metrics.miguelPendingList}
              />

              {/* Late preventives detail */}
              {metrics.latePMs > 0 && (
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <button
                      className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors"
                      onClick={() => setShowLateList((v) => !v)}
                    >
                      <AlertTriangle size={15} className="text-orange-500" />
                      {showLateList ? "Ocultar" : "Ver"} detalle de {metrics.latePMs} preventivos atrasados
                    </button>
                    {showLateList && (
                      <div className="overflow-x-auto rounded-md border border-border">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">OT</th>
                              <th className="px-3 py-2 text-left font-medium">Descripción</th>
                              <th className="px-3 py-2 text-left font-medium">Creación</th>
                              <th className="px-3 py-2 text-left font-medium">Días hábiles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metrics.latePreventivesList.map((l) => (
                              <tr key={l.ordenDeTrabajo} className="border-t border-border">
                                <td className="px-3 py-2 font-mono">{l.ordenDeTrabajo}</td>
                                <td className="px-3 py-2 max-w-[220px] truncate" title={l.descripcion}>
                                  {l.descripcion}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{l.fecha}</td>
                                <td className="px-3 py-2 font-bold text-red-600">{l.diasHabiles}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI results */}
              {metrics.aiAnalyzed && metrics.aiResults.length > 0 && (
                <AIDescriptionsPanel results={metrics.aiResults} />
              )}
            </>
          )}
        </div>
      )}

      {/* ─── TAB: Historial ─── */}
      {tab === "history" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Reportes guardados</h2>
            <button
              onClick={fetchReports}
              disabled={loadingReports}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw size={13} className={loadingReports ? "animate-spin" : ""} />
              Actualizar
            </button>
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
// Tab button
// ──────────────────────────────────────────
function TabBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
