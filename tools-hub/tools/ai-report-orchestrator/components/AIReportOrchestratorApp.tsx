"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ToolInputPanel,
  ToolLayout,
  ToolOutputPanel,
  ToolSection,
} from "@/core/components";
import type {
  ReportConfig,
  ReportDetail,
  ReportFile,
  ReportPhase,
  ReportSummary,
} from "../lib/types";

type AppView = "dashboard" | "wizard" | "review";
type WizardStep = 1 | 2 | 3;

const DEFAULT_CONFIG: ReportConfig = {
  scope: "operational",
  detailLevel: "medium",
  language: "es",
  exportFormat: "docx",
};

const PHASE_LABELS: Record<ReportPhase, string> = {
  queued: "En cola",
  reading_documents: "Leyendo documentos",
  analyzing_data: "Analizando datos",
  generating_charts: "Generando graficos",
  drafting_report: "Redactando informe",
  completed: "Completado",
  error: "Error",
};

export function AIReportOrchestratorApp() {
  const [view, setView] = useState<AppView>("dashboard");
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("Informe Combinado");
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);

  const [activeReport, setActiveReport] = useState<ReportDetail | null>(null);
  const [starting, setStarting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"docx" | "pdf" | "md" | null>(null);

  const isProcessing = useMemo(
    () => reports.some((report) => report.status === "processing"),
    [reports]
  );

  useEffect(() => {
    void fetchReports();
  }, []);

  useEffect(() => {
    if (!isProcessing && !(view === "wizard" && wizardStep === 3 && activeReport)) {
      return;
    }

    const timer = window.setInterval(() => {
      void fetchReports();
      if (activeReport) {
        void fetchReportDetail(activeReport.id, false);
      }
    }, 1800);

    return () => window.clearInterval(timer);
  }, [isProcessing, view, wizardStep, activeReport]);

  const resetWizard = () => {
    setTitle("Informe Combinado");
    setFiles([]);
    setConfig(DEFAULT_CONFIG);
    setWizardStep(1);
    setActiveReport(null);
  };

  const handleStartNew = () => {
    resetWizard();
    setView("wizard");
  };

  async function fetchReports() {
    setLoadingReports(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/reports", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el historial de informes");
      }

      const data = (await response.json()) as { reports: ReportSummary[] };
      setReports(data.reports ?? []);
    } catch (err) {
      console.error("[AIReportOrchestrator] fetchReports", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoadingReports(false);
    }
  }

  async function fetchReportDetail(reportId: string, moveToReview = true) {
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el informe");
      }

      const data = (await response.json()) as { report: ReportDetail };
      setActiveReport(data.report);

      if (moveToReview && data.report.status === "completed") {
        setView("review");
      }
    } catch (err) {
      console.error("[AIReportOrchestrator] fetchReportDetail", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function handleDelete(reportId: string) {
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el informe");
      }

      if (activeReport?.id === reportId) {
        setActiveReport(null);
      }

      await fetchReports();
    } catch (err) {
      console.error("[AIReportOrchestrator] delete", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function handleRename(reportId: string, nextTitle: string) {
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });

      if (!response.ok) {
        throw new Error("No se pudo editar el informe");
      }

      await fetchReports();
      if (activeReport?.id === reportId) {
        await fetchReportDetail(reportId, false);
      }
    } catch (err) {
      console.error("[AIReportOrchestrator] rename", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function handleCreateReport() {
    if (!title.trim()) {
      setError("Debes indicar un titulo para el informe");
      return;
    }

    if (files.length === 0) {
      setError("Debes cargar al menos un archivo fuente");
      return;
    }

    setStarting(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, config, files }),
      });

      if (!response.ok) {
        throw new Error("No se pudo iniciar el flujo de generacion");
      }

      const data = (await response.json()) as { report: ReportDetail };
      setActiveReport(data.report);
      setWizardStep(3);
      await fetchReports();
    } catch (err) {
      console.error("[AIReportOrchestrator] create", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setStarting(false);
    }
  }

  async function handleExport(format: "docx" | "pdf" | "md") {
    if (!activeReport) {
      return;
    }

    setExportingFormat(format);
    setError(null);

    try {
      const response = await fetch(
        `/api/tools/ai-report-orchestrator/reports/${activeReport.id}/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo preparar la exportacion");
      }

      const data = (await response.json()) as {
        export: { fileName: string; downloadUrl: string; generatedAt: string };
      };

      const text = [
        `Archivo: ${data.export.fileName}`,
        `Generado: ${new Date(data.export.generatedAt).toLocaleString()}`,
        `Enlace: ${data.export.downloadUrl}`,
      ].join("\n");
      window.alert(text);
    } catch (err) {
      console.error("[AIReportOrchestrator] export", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setExportingFormat(null);
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Gestor de Informes IA</h2>
          <p className="text-sm text-muted-foreground">
            Historial, wizard guiado y exportacion para informes compuestos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void fetchReports()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={handleStartNew}>
            <Plus className="h-4 w-4" />
            Crear nuevo informe
          </Button>
        </div>
      </header>

      {error && (
        <Card className="border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-5 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      )}

      {view === "dashboard" && (
        <DashboardView
          reports={reports}
          loading={loadingReports}
          onCreate={handleStartNew}
          onDelete={handleDelete}
          onRename={handleRename}
          onOpen={async (reportId) => {
            await fetchReportDetail(reportId, true);
            const report = reports.find((item) => item.id === reportId);
            if (report?.status !== "completed") {
              setView("wizard");
              setWizardStep(3);
            }
          }}
          onQuickDownload={async (reportId) => {
            await fetchReportDetail(reportId, false);
            if (activeReport?.id === reportId) {
              await handleExport("docx");
            } else {
              const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`);
              if (!response.ok) {
                return;
              }
              const data = (await response.json()) as { report: ReportDetail };
              setActiveReport(data.report);
              if (data.report.status === "completed") {
                await handleExport("docx");
              }
            }
          }}
        />
      )}

      {view === "wizard" && (
        <WizardView
          step={wizardStep}
          title={title}
          files={files}
          config={config}
          report={activeReport}
          starting={starting}
          onBack={() => {
            if (wizardStep === 1) {
              setView("dashboard");
              return;
            }
            setWizardStep((prev) => (prev === 3 ? 2 : 1));
          }}
          onSetTitle={setTitle}
          onSetFiles={setFiles}
          onSetConfig={setConfig}
          onNext={() => setWizardStep((prev) => (prev === 1 ? 2 : 3))}
          onStart={handleCreateReport}
          onGoReview={async () => {
            if (!activeReport) {
              return;
            }
            await fetchReportDetail(activeReport.id, true);
          }}
        />
      )}

      {view === "review" && (
        <ReviewView
          report={activeReport}
          exportingFormat={exportingFormat}
          onBackToDashboard={() => setView("dashboard")}
          onReopenWizard={() => {
            setView("wizard");
            setWizardStep(2);
          }}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

function DashboardView({
  reports,
  loading,
  onCreate,
  onDelete,
  onRename,
  onOpen,
  onQuickDownload,
}: {
  reports: ReportSummary[];
  loading: boolean;
  onCreate: () => void;
  onDelete: (reportId: string) => Promise<void>;
  onRename: (reportId: string, nextTitle: string) => Promise<void>;
  onOpen: (reportId: string) => Promise<void>;
  onQuickDownload: (reportId: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (loading && reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={FileText}
          title="No hay informes generados"
          description="Inicia el wizard para crear tu primer informe orquestado con IA."
          action={
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Crear nuevo informe
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const isEditing = editingId === report.id;
        return (
          <Card key={report.id} className="transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="h-8 w-72"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          await onRename(report.id, editingTitle);
                          setEditingId(null);
                        }}
                      >
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Creado {new Date(report.createdAt).toLocaleString()} - Ultima actualizacion {" "}
                    {new Date(report.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={report.status} />
                  <Badge variant="outline">{PHASE_LABELS[report.phase]}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProgressBar value={report.progress} />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => void onOpen(report.id)}>
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(report.id);
                    setEditingTitle(report.title);
                  }}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={report.status !== "completed"}
                  onClick={() => void onQuickDownload(report.id)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void onDelete(report.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function WizardView({
  step,
  title,
  files,
  config,
  report,
  starting,
  onBack,
  onSetTitle,
  onSetFiles,
  onSetConfig,
  onNext,
  onStart,
  onGoReview,
}: {
  step: WizardStep;
  title: string;
  files: ReportFile[];
  config: ReportConfig;
  report: ReportDetail | null;
  starting: boolean;
  onBack: () => void;
  onSetTitle: (title: string) => void;
  onSetFiles: (files: ReportFile[]) => void;
  onSetConfig: (config: ReportConfig) => void;
  onNext: () => void;
  onStart: () => Promise<void>;
  onGoReview: () => Promise<void>;
}) {
  const sidebar = (
    <ToolInputPanel
      title="Configuracion"
      description="Define alcance, nivel de detalle e idioma"
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            Volver
          </Button>
          {step < 2 && (
            <Button size="sm" onClick={onNext}>
              Siguiente
            </Button>
          )}
          {step === 2 && (
            <Button size="sm" disabled={starting} onClick={() => void onStart()}>
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Iniciar procesamiento
            </Button>
          )}
          {step === 3 && report?.status === "completed" && (
            <Button size="sm" onClick={() => void onGoReview()}>
              Revisar informe
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Titulo</label>
        <Input value={title} onChange={(event) => onSetTitle(event.target.value)} />
      </div>

      <SelectField
        label="Alcance"
        value={config.scope}
        onChange={(value) => onSetConfig({ ...config, scope: value as ReportConfig["scope"] })}
        options={[
          { value: "summary", label: "Resumen ejecutivo" },
          { value: "operational", label: "Operacion" },
          { value: "strategic", label: "Estrategico" },
        ]}
      />

      <SelectField
        label="Nivel de detalle"
        value={config.detailLevel}
        onChange={(value) =>
          onSetConfig({ ...config, detailLevel: value as ReportConfig["detailLevel"] })
        }
        options={[
          { value: "low", label: "Bajo" },
          { value: "medium", label: "Medio" },
          { value: "high", label: "Alto" },
        ]}
      />

      <SelectField
        label="Idioma"
        value={config.language}
        onChange={(value) => onSetConfig({ ...config, language: value as ReportConfig["language"] })}
        options={[
          { value: "es", label: "Espanol" },
          { value: "en", label: "English" },
        ]}
      />

      <SelectField
        label="Formato de exportacion"
        value={config.exportFormat}
        onChange={(value) =>
          onSetConfig({ ...config, exportFormat: value as ReportConfig["exportFormat"] })
        }
        options={[
          { value: "docx", label: "DOCX" },
          { value: "pdf", label: "PDF" },
          { value: "md", label: "Markdown" },
        ]}
      />
    </ToolInputPanel>
  );

  return (
    <ToolLayout sidebar={sidebar} sidebarWidth="lg">
      <WizardStepsIndicator step={step} />

      {step === 1 && <UploadStep files={files} onSetFiles={onSetFiles} onNext={onNext} />}
      {step === 2 && <ConfigurationSummaryStep title={title} files={files} config={config} />}
      {step === 3 && <ProcessingStep report={report} onGoReview={onGoReview} />}
    </ToolLayout>
  );
}

function ReviewView({
  report,
  exportingFormat,
  onBackToDashboard,
  onReopenWizard,
  onExport,
}: {
  report: ReportDetail | null;
  exportingFormat: "docx" | "pdf" | "md" | null;
  onBackToDashboard: () => void;
  onReopenWizard: () => void;
  onExport: (format: "docx" | "pdf" | "md") => Promise<void>;
}) {
  if (!report) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={FileText}
          title="No hay informe para revisar"
          description="Abre un informe del dashboard o crea uno nuevo."
        />
      </Card>
    );
  }

  return (
    <ToolLayout
      sidebar={
        <ToolInputPanel
          title="Exportacion"
          description="Descarga en el formato que necesites"
          footer={
            <div className="grid gap-2">
              <Button onClick={() => void onExport("docx")} disabled={!!exportingFormat}>
                {exportingFormat === "docx" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar DOCX
              </Button>
              <Button
                variant="outline"
                onClick={() => void onExport("pdf")}
                disabled={!!exportingFormat}
              >
                {exportingFormat === "pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => void onExport("md")}
                disabled={!!exportingFormat}
              >
                {exportingFormat === "md" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar MD
              </Button>
            </div>
          }
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <StatusBadge status={report.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fase</span>
              <Badge variant="outline">{PHASE_LABELS[report.phase]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{report.progress}%</span>
            </div>
          </div>
        </ToolInputPanel>
      }
      sidebarWidth="md"
    >
      <ToolOutputPanel
        title={report.title}
        description="Vista previa y bitacora de cambios del informe final"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReopenWizard}>
              Editar configuracion
            </Button>
            <Button variant="outline" size="sm" onClick={onBackToDashboard}>
              Volver al dashboard
            </Button>
          </div>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previsualizacion</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[420px] overflow-auto rounded-lg bg-muted/30 p-4 text-xs whitespace-pre-wrap">
              {report.content || "El contenido estara disponible cuando el procesamiento termine."}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registro de cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {report.changeLog.map((entry) => (
                <li key={entry} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/80" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </ToolOutputPanel>
    </ToolLayout>
  );
}

function UploadStep({
  files,
  onSetFiles,
  onNext,
}: {
  files: ReportFile[];
  onSetFiles: (files: ReportFile[]) => void;
  onNext: () => void;
}) {
  return (
    <ToolSection
      title="Paso 1 - Subida de archivos"
      description="Arrastra o selecciona PDF, Word, Excel, imagenes y texto plano"
      variant="subtle"
      actions={
        <Button size="sm" onClick={onNext} disabled={files.length === 0}>
          Continuar
        </Button>
      }
    >
      <label className="block cursor-pointer rounded-xl border border-dashed border-border bg-background p-6 text-center transition-colors hover:border-primary/50">
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []).map((file) => ({
              name: file.name,
              size: file.size,
              mimeType: file.type || "application/octet-stream",
            }));
            onSetFiles(selected);
          }}
        />
        <UploadCloud className="mx-auto h-8 w-8 text-primary/70" />
        <p className="mt-3 text-sm font-medium">Drag and drop o click para seleccionar</p>
        <p className="mt-1 text-xs text-muted-foreground">Maximo recomendado: 20MB por archivo</p>
      </label>

      <div className="mt-4 grid gap-2">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay archivos cargados.</p>
        ) : (
          files.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.max(0.01, file.size / (1024 * 1024)).toFixed(2)} MB - {file.mimeType}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </ToolSection>
  );
}

function ConfigurationSummaryStep({
  title,
  files,
  config,
}: {
  title: string;
  files: ReportFile[];
  config: ReportConfig;
}) {
  return (
    <ToolSection
      title="Paso 2 - Configuracion"
      description="Revisa parametros antes de iniciar el procesamiento"
      variant="subtle"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <InfoBlock label="Titulo" value={title} />
        <InfoBlock label="Archivos" value={`${files.length} archivos`} />
        <InfoBlock label="Alcance" value={config.scope} />
        <InfoBlock label="Detalle" value={config.detailLevel} />
        <InfoBlock label="Idioma" value={config.language} />
        <InfoBlock label="Exportacion" value={config.exportFormat} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        El backend ejecutara fases de lectura, analisis, graficos y redaccion sin bloquear la interfaz.
      </p>
    </ToolSection>
  );
}

function ProcessingStep({
  report,
  onGoReview,
}: {
  report: ReportDetail | null;
  onGoReview: () => Promise<void>;
}) {
  return (
    <ToolSection
      title="Paso 3 - Procesamiento"
      description="Seguimiento por fases del agente"
      variant="subtle"
      actions={
        <Button
          size="sm"
          disabled={!report || report.status !== "completed"}
          onClick={() => void onGoReview()}
        >
          Ir a revision
        </Button>
      }
    >
      {!report ? (
        <p className="text-sm text-muted-foreground">
          Inicia el procesamiento desde el panel lateral para comenzar la orquestacion.
        </p>
      ) : (
        <div className="space-y-4">
          <ProgressBar value={report.progress} />
          <div className="grid gap-2">
            {(
              [
                "reading_documents",
                "analyzing_data",
                "generating_charts",
                "drafting_report",
                "completed",
              ] as ReportPhase[]
            ).map((phase) => {
              const phaseDone = phaseRank(report.phase) >= phaseRank(phase);
              const isCurrent = report.phase === phase;
              return (
                <div
                  key={phase}
                  className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {phaseDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{PHASE_LABELS[phase]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isCurrent && report.status === "processing" ? "en curso" : phaseDone ? "listo" : "pendiente"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ToolSection>
  );
}

function WizardStepsIndicator({ step }: { step: WizardStep }) {
  const items = [
    { id: 1, label: "Subida" },
    { id: 2, label: "Configuracion" },
    { id: 3, label: "Procesamiento" },
  ] as const;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => {
            const active = item.id === step;
            const done = item.id < step;
            return (
              <div
                key={item.id}
                className={[
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  active ? "border-primary bg-primary/10" : "border-border bg-background",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Paso {item.id}</span>
                  {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="rounded-full bg-muted/70 p-1">
      <div
        className="h-2 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ReportSummary["status"] }) {
  if (status === "completed") {
    return (
      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completado
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Error
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      En proceso
    </Badge>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function phaseRank(phase: ReportPhase) {
  switch (phase) {
    case "queued":
      return 0;
    case "reading_documents":
      return 1;
    case "analyzing_data":
      return 2;
    case "generating_charts":
      return 3;
    case "drafting_report":
      return 4;
    case "completed":
      return 5;
    case "error":
      return 6;
    default:
      return 0;
  }
}
