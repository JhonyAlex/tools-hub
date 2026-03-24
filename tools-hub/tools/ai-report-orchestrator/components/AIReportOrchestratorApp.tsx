"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Settings2,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/core/components";
import { OrchestratorSettingsPanel } from "@/tools/ai-report-orchestrator/components/OrchestratorSettingsPanel";
import type { ReportDetail, ReportSource, ReportSummary } from "../lib/types";

type View = "wizard" | "settings";

const DEFAULT_SUGGESTION = "Quiero un reporte completo con texto e imagenes explicativas";

const DEFAULT_CONFIG = {
  scope: "operational" as const,
  detailLevel: "high" as const,
  language: "es" as const,
  exportFormat: "docx" as const,
  caseId: "orchestrator.default",
};

export function AIReportOrchestratorApp() {
  const [view, setView] = useState<View>("wizard");
  const [files, setFiles] = useState<File[]>([]);
  const [goal, setGoal] = useState(DEFAULT_SUGGESTION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [activeReport, setActiveReport] = useState<ReportDetail | null>(null);

  const hasFiles = files.length > 0;

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [reports]
  );

  useEffect(() => {
    void fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/reports", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el historial");
      }

      const data = (await response.json()) as { reports: ReportSummary[] };
      setReports(data.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function openReport(reportId: string) {
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo abrir el reporte");
      }

      const data = (await response.json()) as { report: ReportDetail };
      setActiveReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function deleteReport(reportId: string) {
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar");
      }

      if (activeReport?.id === reportId) {
        setActiveReport(null);
      }
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function generate() {
    if (!goal.trim()) {
      setError("Decime de que queres el reporte.");
      return;
    }

    if (!hasFiles) {
      setError("Subi al menos un archivo para generar el reporte.");
      return;
    }

    setLoading(true);
    setError(null);

    const fileSources: ReportSource[] = files.map((file) => ({
      type: "file",
      file: {
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    }));

    const sources: ReportSource[] = [
      ...fileSources,
      {
        type: "text",
        title: "Objetivo del usuario",
        format: "md",
        content: goal,
      },
    ];

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Reporte: ${goal.slice(0, 60)}`,
          config: DEFAULT_CONFIG,
          sources,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo generar el reporte");
      }

      const data = (await response.json()) as { report: ReportDetail };
      setActiveReport(data.report);
      setFiles([]);
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (view === "settings") {
    return (
      <div className="space-y-4 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Configuracion avanzada</h2>
            <p className="text-sm text-muted-foreground">
              Modelos, proveedores y prompts por agente.
            </p>
          </div>
          <Button variant="outline" onClick={() => setView("wizard")}>
            Volver
          </Button>
        </div>
        <OrchestratorSettingsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">AI Report Orchestrator</h2>
          <p className="text-sm text-muted-foreground">
            Genera reportes completos con texto e imagenes explicativas.
          </p>
        </div>
        <Button variant="outline" onClick={() => setView("settings")}>
          <Settings2 className="h-4 w-4" />
          Ajustes avanzados
        </Button>
      </header>

      {error ? (
        <Card className="border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-5 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1) Sube tus archivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block cursor-pointer rounded-xl border border-dashed border-border bg-background p-6 text-center transition-colors hover:border-primary/50">
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt,.md"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((prev) => [...prev, ...selected]);
                event.currentTarget.value = "";
              }}
            />
            <UploadCloud className="mx-auto h-8 w-8 text-primary/70" />
            <p className="mt-3 text-sm font-medium">Hace click para agregar archivos</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, Office, imagenes, CSV, TXT o MD</p>
          </label>

          <div className="grid gap-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavia no cargaste archivos.</p>
            ) : (
              files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0.01, file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2) De que queres tu reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder={DEFAULT_SUGGESTION}
          />
          <Button onClick={() => void generate()} disabled={loading || !hasFiles || !goal.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ultimo resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeReport ? (
            <EmptyState
              icon={FileText}
              title="Todavia no generaste reportes"
              description="Subi tus archivos, escribi el objetivo y toca Generar."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeReport.phase}</Badge>
                {activeReport.status === "completed" ? (
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                    <XCircle className="h-3.5 w-3.5" />
                    Error
                  </Badge>
                )}
              </div>
              <pre className="max-h-[360px] overflow-auto rounded-lg bg-muted/30 p-4 text-xs whitespace-pre-wrap">
                {activeReport.content}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay reportes guardados.</p>
          ) : (
            sortedReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{report.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString()} - {report.progress}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => void openReport(report.id)}>
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void deleteReport(report.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
