// ============================================================
// AI ANALYSIS SERVICE - Uses OpenRouter API to evaluate
// description quality and solution documentation
// ============================================================
import type { OTRecord, AIAnalysisResult } from "../types";
import { getPreviousBusinessDay, parseMadridDate, isSameDay } from "./dateUtils";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-v3.2";

const BATCH_SIZE = 20;

interface AIBatchItem {
  id: string;
  descripcion: string;
  observaciones: string;
}

async function analyzeBatch(
  items: AIBatchItem[],
  apiKey: string
): Promise<AIAnalysisResult[]> {
  const prompt = `Eres un auditor de órdenes de trabajo de mantenimiento industrial. Analiza cada OT y determina si:
1. "descripcion": describe claramente QUÉ FALLÓ o QUÉ PROBLEMA motivó el mantenimiento (no vale solo poner el nombre de una máquina o "revisión").
2. "observaciones": explica claramente CÓMO SE SOLUCIONÓ el problema (no vale solo "solucionado" o "realizado").

Responde SOLO con un array JSON válido, sin texto adicional, con este formato por cada OT:
{
  "id": "<id>",
  "descripcionScore": "good" | "bad",
  "descripcionIssue": null | "<breve razón>",
  "observacionesScore": "good" | "bad",
  "observacionesIssue": null | "<breve razón>"
}

OTs a analizar:
${JSON.stringify(items, null, 2)}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tools-hub.local",
      "X-Title": "Pigmea Reporte Mantenimiento",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "[]";

  // Extract JSON array from response (handles markdown code blocks)
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    id: string;
    descripcionScore: "good" | "bad";
    descripcionIssue: string | null;
    observacionesScore: "good" | "bad";
    observacionesIssue: string | null;
  }>;

  return parsed.map((p) => ({
    ordenDeTrabajo: p.id,
    descripcionScore: p.descripcionScore ?? "unknown",
    descripcionIssue: p.descripcionIssue ?? null,
    observacionesScore: p.observacionesScore ?? "unknown",
    observacionesIssue: p.observacionesIssue ?? null,
  }));
}

export async function analyzeDescriptions(
  records: OTRecord[],
  apiKey: string,
): Promise<AIAnalysisResult[]> {
  // Only analyze OTs terminated the previous business day
  const yesterday = getPreviousBusinessDay(new Date());
  const toAnalyze = records.filter((r) => {
    if (r.estado.trim().toLowerCase() !== "terminado") return false;
    const finDate = parseMadridDate(r.fechaDeFinDeSLA);
    return finDate ? isSameDay(finDate, yesterday) : false;
  });

  if (toAnalyze.length === 0) return [];

  const batches: AIBatchItem[][] = [];
  for (let i = 0; i < toAnalyze.length; i += BATCH_SIZE) {
    batches.push(
      toAnalyze.slice(i, i + BATCH_SIZE).map((r) => ({
        id: r.ordenDeTrabajo,
        descripcion: r.descripcion,
        observaciones: r.observaciones,
      }))
    );
  }

  const results: AIAnalysisResult[] = [];
  for (const batch of batches) {
    const batchResults = await analyzeBatch(batch, apiKey);
    results.push(...batchResults);
  }

  return results;
}
