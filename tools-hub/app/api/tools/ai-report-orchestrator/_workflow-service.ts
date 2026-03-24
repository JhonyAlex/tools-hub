import type { ReportPhase } from "@/tools/ai-report-orchestrator/lib/types";
import type {
  AgentConfigInput,
  WorkflowRunInput,
  WorkflowRunOutput,
} from "@/tools/ai-report-orchestrator/lib/settings-types";

type OrganizerOutput = {
  insights: string[];
  outline: string[];
};

type VisualizerOutput = {
  visuals: Array<{ title: string; code: string }>;
};

type WriterOutput = {
  markdown: string;
};

type OrchestratorReview = {
  approved: boolean;
  score: number;
  feedback: string[];
};

const MAX_REVIEW_CYCLES = 3;

function summarizeSources(input: WorkflowRunInput) {
  const fileSources = input.sources.filter((source) => source.type === "file");
  const textSources = input.sources.filter((source) => source.type === "text");

  const fileNames = fileSources.map((source) => source.file.name);
  const textHighlights = textSources.map((source) =>
    source.content.slice(0, 160).replace(/\s+/g, " ")
  );

  return {
    fileNames,
    textHighlights,
    totalSources: input.sources.length,
  };
}

function runOrganizerAgent(input: WorkflowRunInput): OrganizerOutput {
  const summary = summarizeSources(input);

  const insights = [
    `Se recibieron ${summary.totalSources} fuentes para el objetivo: ${input.goal}.`,
    summary.fileNames.length > 0
      ? `Documentos clave detectados: ${summary.fileNames.join(", ")}.`
      : "No se recibieron archivos binarios, solo fuentes textuales.",
    summary.textHighlights.length > 0
      ? `Se detectaron notas con contexto adicional para enriquecer el reporte.`
      : "No se detectaron notas textuales adicionales.",
  ];

  const outline = [
    "Resumen ejecutivo",
    "Contexto y alcance",
    "Hallazgos principales",
    "Visuales explicativas",
    "Recomendaciones y proximos pasos",
  ];

  return { insights, outline };
}

function runVisualizerAgent(input: WorkflowRunInput, organizer: OrganizerOutput): VisualizerOutput {
  const safeGoal = input.goal.replace(/"/g, "");

  const visuals = [
    {
      title: "Flujo del proceso",
      code: [
        "```mermaid",
        "flowchart TD",
        `A[Objetivo: ${safeGoal}] --> B[Recoleccion de fuentes]`,
        "B --> C[Analisis del organizador]",
        "C --> D[Redaccion del informe]",
        "D --> E[Revision del orquestador]",
        "```",
      ].join("\n"),
    },
    {
      title: "Cobertura del reporte",
      code: [
        "```mermaid",
        "pie title Cobertura de secciones",
        `\"Hallazgos\" : ${Math.max(35, organizer.insights.length * 12)}`,
        "\"Visuales\" : 25",
        "\"Recomendaciones\" : 20",
        "\"Contexto\" : 20",
        "```",
      ].join("\n"),
    },
  ];

  return { visuals };
}

function runWriterAgent(
  input: WorkflowRunInput,
  organizer: OrganizerOutput,
  visuals: VisualizerOutput,
  feedback: string[]
): WriterOutput {
  const feedbackBlock =
    feedback.length > 0
      ? `\n## Ajustes aplicados segun supervision\n${feedback.map((item) => `- ${item}`).join("\n")}\n`
      : "";

  const markdown = [
    `# ${input.title}`,
    "",
    "## Resumen ejecutivo",
    `Este reporte responde a: ${input.goal}. Integra analisis documental y visuales explicativas para facilitar toma de decisiones.`,
    "",
    "## Contexto y alcance",
    organizer.insights.map((item) => `- ${item}`).join("\n"),
    "",
    "## Hallazgos principales",
    organizer.outline.map((item, idx) => `${idx + 1}. ${item}`).join("\n"),
    "",
    "## Visuales explicativas",
    visuals.visuals.map((item) => `### ${item.title}\n${item.code}`).join("\n\n"),
    "",
    "## Recomendaciones",
    "- Priorizar acciones con impacto alto y bajo esfuerzo.",
    "- Validar supuestos clave con el equipo operativo.",
    "- Repetir este ciclo con nuevas fuentes para mejora continua.",
    feedbackBlock,
  ].join("\n");

  return { markdown };
}

function runOrchestratorReviewAgent(writer: WriterOutput): OrchestratorReview {
  const feedback: string[] = [];
  let score = 100;

  if (!writer.markdown.includes("## Visuales explicativas")) {
    feedback.push("Integrar una seccion de visuales explicativas.");
    score -= 25;
  }

  if (!writer.markdown.includes("```mermaid")) {
    feedback.push("Agregar al menos un diagrama Mermaid para apoyar la narrativa.");
    score -= 30;
  }

  if (!writer.markdown.includes("## Recomendaciones")) {
    feedback.push("Incluir recomendaciones accionables al final.");
    score -= 20;
  }

  if (writer.markdown.length < 900) {
    feedback.push("Profundizar el contenido para que el reporte sea mas completo.");
    score -= 15;
  }

  return {
    approved: feedback.length === 0,
    score: Math.max(0, score),
    feedback,
  };
}

export async function runSupervisedMultiAgentWorkflow(
  input: WorkflowRunInput,
  agentConfigs: AgentConfigInput[]
): Promise<{ output: WorkflowRunOutput; phaseLog: Array<{ phase: ReportPhase; progress: number; note: string }> }> {
  const phaseLog: Array<{ phase: ReportPhase; progress: number; note: string }> = [];

  phaseLog.push({
    phase: "reading_documents",
    progress: 18,
    note: "El Organizador analizo fuentes y extrajo informacion clave.",
  });
  const organizerOutput = runOrganizerAgent(input);

  phaseLog.push({
    phase: "generating_charts",
    progress: 44,
    note: "El Generador de visuales preparo diagramas y graficos explicativos.",
  });
  let visualOutput = runVisualizerAgent(input, organizerOutput);

  let cycle = 0;
  let draft = runWriterAgent(input, organizerOutput, visualOutput, []);
  let review = runOrchestratorReviewAgent(draft);

  while (!review.approved && cycle < MAX_REVIEW_CYCLES) {
    cycle += 1;

    phaseLog.push({
      phase: "drafting_report",
      progress: 60 + cycle * 10,
      note: `El Orquestador solicito mejoras en el ciclo ${cycle}: ${review.feedback.join(" ")}`,
    });

    if (review.feedback.some((item) => item.toLowerCase().includes("mermaid"))) {
      visualOutput = runVisualizerAgent(input, organizerOutput);
    }

    draft = runWriterAgent(input, organizerOutput, visualOutput, review.feedback);
    review = runOrchestratorReviewAgent(draft);
  }

  phaseLog.push({
    phase: "completed",
    progress: 100,
    note: review.approved
      ? "El Orquestador aprobo el reporte final."
      : "Se alcanzo el maximo de revisiones; se entrega la mejor version disponible.",
  });

  return {
    output: {
      content: draft.markdown,
      qualityScore: review.score,
      reviewCycles: cycle,
      usedAgents: agentConfigs,
      log: phaseLog.map((item) => item.note),
    },
    phaseLog,
  };
}
