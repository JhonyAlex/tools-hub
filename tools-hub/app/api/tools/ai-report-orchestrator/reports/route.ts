import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { createReport, listReports } from "./_store";
import { getOrchestratorSettings } from "../_settings-service";
import { runSupervisedMultiAgentWorkflow } from "../_workflow-service";

const MAX_TEXT_SOURCES = 10;
const MAX_TEXT_SOURCE_CHARS = 10_000;
const MAX_TOTAL_SOURCES = 20;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function validateSources(value: unknown) {
  if (!Array.isArray(value)) {
    return "sources must be an array";
  }

  if (value.length === 0) {
    return "at least one source is required";
  }

  if (value.length > MAX_TOTAL_SOURCES) {
    return `sources cannot exceed ${MAX_TOTAL_SOURCES}`;
  }

  let textCount = 0;
  for (const source of value) {
    if (!isObject(source) || typeof source.type !== "string") {
      return "each source must include a valid type";
    }

    if (source.type === "file") {
      if (!isObject(source.file)) {
        return "file source must include file metadata";
      }

      const { name, size, mimeType } = source.file;
      if (typeof name !== "string" || !name.trim()) {
        return "file name is required";
      }

      if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
        return "file size must be a valid number";
      }

      if (typeof mimeType !== "string" || !mimeType.trim()) {
        return "file mimeType is required";
      }
      continue;
    }

    if (source.type === "text") {
      textCount += 1;
      if (textCount > MAX_TEXT_SOURCES) {
        return `text sources cannot exceed ${MAX_TEXT_SOURCES}`;
      }

      if (typeof source.title !== "string" || !source.title.trim()) {
        return "text source title is required";
      }

      if (source.format !== "md") {
        return 'text source format must be "md"';
      }

      if (typeof source.content !== "string" || !source.content.trim()) {
        return "text source content is required";
      }

      if (source.content.length > MAX_TEXT_SOURCE_CHARS) {
        return `text source content cannot exceed ${MAX_TEXT_SOURCE_CHARS} chars`;
      }
      continue;
    }

    return "unsupported source type";
  }

  return null;
}

function validatePayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return "Invalid body";
  }

  const data = body as Record<string, unknown>;
  if (typeof data.title !== "string" || !data.title.trim()) {
    return "title is required";
  }

  if (!data.config || typeof data.config !== "object") {
    return "config is required";
  }

  const sourcesError = validateSources(data.sources);
  if (sourcesError) {
    return sourcesError;
  }

  return null;
}

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const reports = listReports(userId);
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const data = body as {
    title: string;
    config: {
      scope: "summary" | "operational" | "strategic";
      detailLevel: "low" | "medium" | "high";
      language: "es" | "en";
      exportFormat: "docx" | "pdf" | "md";
      caseId?: string;
    };
    sources: Array<
      | {
          type: "file";
          file: { name: string; size: number; mimeType: string };
        }
      | {
          type: "text";
          title: string;
          content: string;
          format: "md";
        }
    >;
  };

  let orchestration:
    | {
        caseId: string;
        usedModelId: string;
        usedProviderId: string;
        usedPromptVersion: number;
        traceId: string;
        attempts: Array<{ modelId: string; providerId?: string; ok: boolean; error?: string }>;
      }
    | undefined;
  let content = "";
  let changeLog: string[] = [];

  try {
    const settings = await getOrchestratorSettings(userId);
    const workflow = await runSupervisedMultiAgentWorkflow(
      {
        title: data.title.trim(),
        goal: `Crear un reporte completo sobre: ${data.title.trim()}`,
        sources: data.sources,
        language: data.config.language,
      },
      settings.agents
    );

    const orchestratorAgent = settings.agents.find((agent) => agent.role === "orchestrator");

    orchestration = {
      caseId: data.config.caseId || "orchestrator.default",
      usedModelId: orchestratorAgent?.model || "deepseek/deepseek-chat-v3-0324",
      usedProviderId: orchestratorAgent?.provider || settings.globalProvider,
      usedPromptVersion: 1,
      traceId: crypto.randomUUID(),
      attempts: settings.agents.map((agent) => ({
        modelId: `${agent.role}:${agent.model}`,
        providerId: agent.provider,
        ok: true,
      })),
    };

    content = workflow.output.content;
    changeLog = [
      ...workflow.output.log,
      `Calidad final evaluada por supervisor: ${workflow.output.qualityScore}/100`,
      `Ciclos de supervision: ${workflow.output.reviewCycles}`,
    ];
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `No se pudo ejecutar el flujo multi-agente: ${error.message}`
            : "No se pudo ejecutar el flujo multi-agente",
      },
      { status: 502 }
    );
  }

  const report = createReport(userId, {
    title: data.title.trim(),
    config: data.config,
    sources: data.sources,
    orchestration,
    content,
    phase: "completed",
    progress: 100,
    status: "completed",
    changeLog,
  });

  return NextResponse.json({ report }, { status: 201 });
}
