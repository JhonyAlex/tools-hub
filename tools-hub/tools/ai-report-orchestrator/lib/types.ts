export type ReportStatus = "processing" | "completed" | "error";

export type ReportPhase =
  | "queued"
  | "reading_documents"
  | "analyzing_data"
  | "generating_charts"
  | "drafting_report"
  | "completed"
  | "error";

export interface ReportConfig {
  scope: "summary" | "operational" | "strategic";
  detailLevel: "low" | "medium" | "high";
  language: "es" | "en";
  exportFormat: "docx" | "pdf" | "md";
  caseId?: string;
}

export interface ReportOrchestrationMeta {
  caseId: string;
  usedModelId: string;
  usedProviderId: string;
  usedPromptVersion: number;
  traceId: string;
  attempts: Array<{ modelId: string; providerId?: string; ok: boolean; error?: string }>;
}

export interface ReportFile {
  name: string;
  size: number;
  mimeType: string;
}

export interface ReportFileSource {
  type: "file";
  file: ReportFile;
}

export interface ReportTextSource {
  type: "text";
  title: string;
  content: string;
  format: "md";
}

export type ReportSource = ReportFileSource | ReportTextSource;

export interface ReportSummary {
  id: string;
  title: string;
  status: ReportStatus;
  phase: ReportPhase;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends ReportSummary {
  config: ReportConfig;
  sources: ReportSource[];
  content: string;
  changeLog: string[];
  orchestration?: ReportOrchestrationMeta;
}
