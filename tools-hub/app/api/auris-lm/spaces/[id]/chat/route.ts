import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/core/lib/db";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { retrieveRelevantChunks } from "@/tools/auris-lm/lib/semanticRetriever";

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface BraveResult {
  title?: string;
  description?: string;
  url?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveResult[];
  };
}

interface Citation {
  chunkId: string;
  docName: string;
  quote: string;
}

interface StructuredAnswer {
  answer: string;
  grounded: boolean;
  missingInfo: string | null;
  citations: Citation[];
}

interface OpenRouterMessage {
  content?: string;
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    grounded: { type: "boolean" },
    missingInfo: { type: ["string", "null"] },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chunkId: { type: "string" },
          docName: { type: "string" },
          quote: { type: "string" },
        },
        required: ["chunkId", "docName", "quote"],
        additionalProperties: false,
      },
    },
  },
  required: ["answer", "grounded", "missingInfo", "citations"],
  additionalProperties: false,
};

function parseStructuredAnswer(raw: string): StructuredAnswer | null {
  try {
    return JSON.parse(raw) as StructuredAnswer;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as StructuredAnswer;
    } catch {
      return null;
    }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getRequestUserId(req);
  if (!userId) return unauthorizedResponse();

  const { id: spaceId } = await params;

  const body = (await req.json()) as {
    message: string;
    webSearch?: boolean;
    history?: ChatHistoryItem[];
  };

  const { message, webSearch = false, history = [] } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Mensaje vacio" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const space = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id
    FROM "AurisLMSpace"
    WHERE id = ${spaceId}
      AND "userId" = ${userId}
    LIMIT 1
  `);

  if (space.length === 0) {
    return new Response(JSON.stringify({ error: "Espacio no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const topChunks = await retrieveRelevantChunks({
          userId,
          spaceId,
          query: message,
          topK: 8,
        });

        const availableByChunk = new Map(
          topChunks.map((chunk) => [
            chunk.id,
            {
              chunkId: chunk.id,
              docName: chunk.docName,
              quote: chunk.content.slice(0, 280),
            },
          ])
        );

        const hasDocContext = topChunks.length > 0;
        const docContext = topChunks
          .map((chunk, idx) => {
            return [
              `[Chunk ${idx + 1}]`,
              `chunkId: ${chunk.id}`,
              `docName: ${chunk.docName}`,
              `content: ${chunk.content}`,
            ].join("\n");
          })
          .join("\n\n---\n\n");

        let webContext = "";
        const usedWebSearch = webSearch;

        if (webSearch) {
          const braveKey = process.env.BRAVE_API_KEY;
          if (braveKey) {
            try {
              const braveRes = await fetch(
                `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(message)}&count=5`,
                {
                  headers: {
                    "X-Subscription-Token": braveKey,
                    Accept: "application/json",
                  },
                }
              );
              if (braveRes.ok) {
                const braveData = (await braveRes.json()) as BraveSearchResponse;
                const results = braveData.web?.results ?? [];
                webContext = results
                  .map(
                    (r, i) =>
                      `[Web ${i + 1}] ${r.title ?? ""}\n${r.description ?? ""}\nURL: ${r.url ?? ""}`
                  )
                  .join("\n\n");
              }
            } catch (error) {
              console.error("[AurisLM] Brave search error:", error);
            }
          }
        }

        const hasWebContext = webContext.trim().length > 0;

        const systemPrompt = `Eres AurisLM, asistente RAG de alta precision.

REGLAS OBLIGATORIAS:
1. Usa unicamente el CONTEXTO RECUPERADO entregado abajo.
2. Si la respuesta no esta en ese contexto, responde que no hay evidencia suficiente.
3. No inventes datos, nombres, fechas ni cifras.
4. Cita con precision usando chunkId y docName de los bloques disponibles.
5. Si usas contexto web, indicalo en missingInfo o en answer.
6. Responde en el idioma del usuario.

SALIDA:
Devuelve JSON valido que cumpla estrictamente el schema solicitado.

${hasDocContext ? `CONTEXTO RECUPERADO:\n${docContext}` : "CONTEXTO RECUPERADO: (vacio)"}
${hasWebContext ? `\n\nCONTEXTO WEB:\n${webContext}` : ""}`.trim();

        const openRouterMessages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ];

        const orKey = process.env.OPENROUTER_API_KEY;
        if (!orKey) {
          sendEvent({ type: "delta", delta: "Error: OPENROUTER_API_KEY no configurada." });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${orKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tools-hub.app",
            "X-Title": "AurisLM",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-v3.2",
            messages: openRouterMessages,
            stream: false,
            temperature: 0.1,
            max_tokens: 2048,
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "auris_grounded_response",
                strict: true,
                schema: RESPONSE_SCHEMA,
              },
            },
          }),
        });

        if (!orRes.ok) {
          const errText = await orRes.text().catch(() => "unknown");
          sendEvent({ type: "delta", delta: `Error del servidor de IA: ${orRes.status} - ${errText}` });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const responsePayload = (await orRes.json()) as OpenRouterResponse;
        const rawContent = responsePayload.choices?.[0]?.message?.content ?? "";
        const parsed = parseStructuredAnswer(rawContent);

        const structured: StructuredAnswer = parsed ?? {
          answer: "No pude estructurar la respuesta. Intenta reformular tu pregunta.",
          grounded: false,
          missingInfo: "Respuesta no estructurada por el modelo",
          citations: [],
        };

        const validatedCitations = structured.citations
          .map((citation) => {
            const available = availableByChunk.get(citation.chunkId);
            if (!available) return null;
            return {
              chunkId: citation.chunkId,
              docName: citation.docName || available.docName,
              quote: citation.quote || available.quote,
            };
          })
          .filter((citation): citation is Citation => citation !== null);

        const answer = structured.answer.trim();
        const chunkSize = 120;
        for (let i = 0; i < answer.length; i += chunkSize) {
          sendEvent({ type: "delta", delta: answer.slice(i, i + chunkSize) });
        }

        sendEvent({
          type: "final",
          grounded: structured.grounded,
          missingInfo: structured.missingInfo,
          citations: validatedCitations,
          webSearchUsed: usedWebSearch,
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        void (async () => {
          try {
            await db.$executeRaw(Prisma.sql`
              INSERT INTO "AurisLMChatMessage" (
                id,
                "userId",
                "spaceId",
                role,
                content,
                "webSearchUsed"
              )
              VALUES (
                ${crypto.randomUUID()},
                ${userId},
                ${spaceId},
                ${"user"},
                ${message},
                ${false}
              )
            `);

            await db.$executeRaw(Prisma.sql`
              INSERT INTO "AurisLMChatMessage" (
                id,
                "userId",
                "spaceId",
                role,
                content,
                grounded,
                "webSearchUsed",
                sources
              )
              VALUES (
                ${crypto.randomUUID()},
                ${userId},
                ${spaceId},
                ${"assistant"},
                ${answer},
                ${structured.grounded},
                ${usedWebSearch},
                ${validatedCitations.length > 0 ? JSON.stringify(validatedCitations) : null}::jsonb
              )
            `);
            await db.aurisLMSpace.update({
              where: { id: spaceId },
              data: { updatedAt: new Date() },
            });
          } catch (dbErr) {
            console.error("[AurisLM] DB persist error:", dbErr);
          }
        })();
      } catch (err) {
        console.error("[AurisLM] chat stream error:", err);
        sendEvent({ type: "delta", delta: "Ocurrio un error. Por favor intenta de nuevo." });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
