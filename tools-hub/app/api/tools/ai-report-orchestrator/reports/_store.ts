type ReportStatus = "processing" | "completed" | "error";

type ReportPhase =
  | "queued"
  | "reading_documents"
  | "analyzing_data"
  | "generating_charts"
  | "drafting_report"
  | "completed"
  | "error";

interface ReportConfig {
  scope: "summary" | "operational" | "strategic";
  detailLevel: "low" | "medium" | "high";
  language: "es" | "en";
  exportFormat: "docx" | "pdf" | "md";
  caseId?: string;
}

interface ReportOrchestrationMeta {
  caseId: string;
  usedModelId: string;
  usedProviderId: string;
  usedPromptVersion: number;
  traceId: string;
  attempts: Array<{ modelId: string; providerId?: string; ok: boolean; error?: string }>;
}

interface ReportFile {
  name: string;
  size: number;
  mimeType: string;
}

interface ReportFileSource {
  type: "file";
  file: ReportFile;
}

interface ReportTextSource {
  type: "text";
  title: string;
  content: string;
  format: "md";
}

type ReportSource = ReportFileSource | ReportTextSource;

interface InternalReport {
  id: string;
  userId: string;
  title: string;
  status: ReportStatus;
  phase: ReportPhase;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  config: ReportConfig;
  sources: ReportSource[];
  content: string;
  changeLog: string[];
  orchestration?: ReportOrchestrationMeta;
  errorMessage?: string;
}

interface CreateReportInput {
  title: string;
  config: ReportConfig;
  sources: ReportSource[];
  orchestration?: ReportOrchestrationMeta;
  content?: string;
  phase?: ReportPhase;
  status?: ReportStatus;
  progress?: number;
  changeLog?: string[];
}

const reportsStore = new Map<string, InternalReport>();

function now() {
  return new Date();
}

function makeId() {
  return `rio_${crypto.randomUUID()}`;
}

function toJSON(report: InternalReport) {
  return {
    id: report.id,
    title: report.title,
    status: report.status,
    phase: report.phase,
    progress: report.progress,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    config: report.config,
    sources: report.sources,
    content: report.content,
    changeLog: report.changeLog,
    orchestration: report.orchestration,
    errorMessage: report.errorMessage,
  };
}


export function createReport(userId: string, input: CreateReportInput) {
  const createdAt = now();
  const status = input.status ?? "processing";
  const phase = input.phase ?? "queued";
  const progress = input.progress ?? (status === "completed" ? 100 : 5);

  const report: InternalReport = {
    id: makeId(),
    userId,
    title: input.title,
    status,
    phase,
    progress,
    createdAt,
    updatedAt: createdAt,
    startedAt: createdAt,
    config: input.config,
    sources: input.sources,
    content: input.content ?? "",
    orchestration: input.orchestration,
    changeLog: input.changeLog ?? [
      "Report created",
      "Input sources received",
      ...(input.orchestration
        ? [
            `Model selected: ${input.orchestration.usedModelId}`,
            `Provider selected: ${input.orchestration.usedProviderId}`,
          ]
        : []),
      status === "completed" ? "Pipeline completed" : "Pipeline enqueued",
    ],
  };

  reportsStore.set(report.id, report);
  return toJSON(report);
}

export function listReports(userId: string) {
  return Array.from(reportsStore.values())
    .filter((report) => report.userId === userId)
    .map((report) => toJSON(report))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getReport(userId: string, reportId: string) {
  const report = reportsStore.get(reportId);
  if (!report || report.userId !== userId) {
    return null;
  }

  return toJSON(report);
}

export function deleteReport(userId: string, reportId: string) {
  const report = reportsStore.get(reportId);
  if (!report || report.userId !== userId) {
    return false;
  }

  reportsStore.delete(reportId);
  return true;
}

export function updateReportTitle(userId: string, reportId: string, title: string) {
  const report = reportsStore.get(reportId);
  if (!report || report.userId !== userId) {
    return null;
  }

  report.title = title;
  report.updatedAt = now();
  report.changeLog.unshift("Title updated from dashboard");

  return toJSON(report);
}

export function createExportToken(userId: string, reportId: string, format: "docx" | "pdf" | "md") {
  const report = reportsStore.get(reportId);
  if (!report || report.userId !== userId) {
    return null;
  }

  const safeName = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    fileName: `${safeName || "report"}.${format}`,
    downloadUrl: `https://example.invalid/exports/${report.id}.${format}`,
    generatedAt: new Date().toISOString(),
  };
}

