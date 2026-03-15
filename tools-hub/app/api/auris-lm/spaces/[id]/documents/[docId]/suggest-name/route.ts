import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

interface OpenRouterMessage {
  content?: string;
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

const MODEL = "openai/gpt-oss-120b:free";

function normalizeSuggestedName(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/[`"'_*#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const short = cleaned
    .split(" ")
    .filter(Boolean)
    .slice(0, 6)
    .join(" ")
    .trim();

  return short || fallback;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id: spaceId, docId } = await params;

    const document = await db.aurisLMDocument.findFirst({
      where: { id: docId, spaceId, userId },
      select: {
        id: true,
        spaceId: true,
        originalName: true,
        storedPath: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        extractedText: true,
        createdAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (!document.extractedText?.trim()) {
      return NextResponse.json(
        { error: "La fuente aún no tiene contenido procesado para sugerir un nombre" },
        { status: 409 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY no configurada" }, { status: 500 });
    }

    const excerpt = document.extractedText.replace(/\s+/g, " ").trim().slice(0, 2400);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 24,
        messages: [
          {
            role: "system",
            content:
              "Genera un nombre corto y preciso para una fuente documental. Responde solo con una frase muy corta de 2 a 6 palabras, sin comillas, sin punto final, sin explicaciones.",
          },
          {
            role: "user",
            content: [
              `Nombre actual: ${document.originalName}`,
              `Tipo MIME: ${document.mimeType}`,
              "Contenido de la fuente:",
              excerpt,
            ].join("\n\n"),
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[AurisLM] Suggest name OpenRouter error:", response.status, body);
      return NextResponse.json({ error: "No se pudo generar el nombre sugerido" }, { status: 502 });
    }

    const payload = (await response.json()) as OpenRouterResponse;
    const rawSuggestion = payload.choices?.[0]?.message?.content?.trim() ?? "";
    const suggestedName = normalizeSuggestedName(rawSuggestion, document.originalName);

    const updated = await db.aurisLMDocument.update({
      where: { id: document.id },
      data: { originalName: suggestedName },
      select: {
        id: true,
        spaceId: true,
        originalName: true,
        storedPath: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ document: updated, suggestedName });
  } catch (error) {
    console.error("[AurisLM] Suggest name:", error);
    return NextResponse.json({ error: "Error al sugerir el nombre de la fuente" }, { status: 500 });
  }
}