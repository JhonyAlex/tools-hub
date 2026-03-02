import { NextRequest } from "next/server";
import { db } from "@/core/lib/db";
import { rankChunks, type ChunkData } from "@/tools/auris-lm/lib/ragEngine";

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

interface OpenRouterDelta {
  content?: string;
}

interface OpenRouterChoice {
  delta?: OpenRouterDelta;
  finish_reason?: string | null;
}

interface OpenRouterChunk {
  choices?: OpenRouterChoice[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: spaceId } = await params;

  const body = await req.json() as {
    message: string;
    webSearch?: boolean;
    history?: ChatHistoryItem[];
  };

  const { message, webSearch = false, history = [] } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Mensaje vacío" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // 1. Fetch all chunks for the space (BM25 is in-memory)
        const dbChunks = await db.aurisLMChunk.findMany({
          where: { spaceId },
          select: {
            id: true,
            documentId: true,
            spaceId: true,
            content: true,
            chunkIndex: true,
            document: { select: { originalName: true } },
          },
        });

        const chunks = dbChunks as ChunkData[];
        const topChunks = rankChunks(message, chunks, 8);

        // Build sources for client
        const sources = topChunks.map((c) => ({
          docName: c.docName,
          snippet: c.content.slice(0, 200) + (c.content.length > 200 ? "…" : ""),
        }));

        // 2. Optional Brave web search
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
            } catch (e) {
              console.error("[AurisLM] Brave search error:", e);
            }
          }
        }

        // 3. Build system prompt
        const docContext = topChunks
          .map((c, i) => `[Doc ${i + 1} – ${c.docName}]\n${c.content}`)
          .join("\n\n---\n\n");

        const hasDocContext = docContext.trim().length > 0;

        const hasWebContext = webContext.trim().length > 0;

        const systemPrompt = `Eres AurisLM, un asistente de análisis de documentos preciso y confiable.

REGLAS:
${hasDocContext
  ? `1. Responde principalmente con información del CONTEXTO DE DOCUMENTOS.
2. Cita el documento fuente cuando uses información de él: "(Fuente: [nombre del doc])".
3. Si la información no está en los documentos${hasWebContext ? " pero sí en el contexto web, usa el contexto web e indícalo con \"(Fuente: Web)\"" : ", di exactamente: \"No encontré esa información en los documentos de este espacio.\""}.
4. NO inventes información ni uses conocimiento propio que no aparezca en los contextos proporcionados.`
  : hasWebContext
  ? `1. No hay documentos relevantes en el espacio para esta pregunta. Responde usando el CONTEXTO WEB proporcionado.
2. Indica siempre "(Fuente: Web)" cuando uses información web.
3. NO inventes información que no aparezca en el contexto web.`
  : `1. No hay documentos en este espacio ni contexto web disponible.
2. Responde EXACTAMENTE: "No encontré esa información en los documentos de este espacio."`
}
5. Sé directo, claro y conciso. Responde en el idioma de la pregunta del usuario.

${hasDocContext ? `CONTEXTO DE DOCUMENTOS:\n${docContext}` : ""}${hasWebContext ? `\n\nCONTEXTO WEB (búsqueda en tiempo real):\n${webContext}` : ""}`.trim();

        // 4. Build messages for OpenRouter
        const openRouterMessages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ];

        // 5. Stream from OpenRouter (DeepSeek v3.2)
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
            stream: true,
            temperature: 0.1,
            max_tokens: 2048,
          }),
        });

        if (!orRes.ok || !orRes.body) {
          const errText = await orRes.text().catch(() => "unknown");
          sendEvent({ type: "delta", delta: `Error del servidor de IA: ${orRes.status} – ${errText}` });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        // Stream the response
        const reader = orRes.body.getReader();
        const dec = new TextDecoder();
        let fullContent = "";
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const chunk = JSON.parse(raw) as OpenRouterChunk;
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                sendEvent({ type: "delta", delta });
              }
            } catch {
              // ignore
            }
          }
        }

        // Send sources metadata
        sendEvent({ type: "sources", sources, webSearchUsed: usedWebSearch });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        // 6. Persist messages to DB (fire and forget)
        void (async () => {
          try {
            await db.aurisLMChatMessage.createMany({
              data: [
                {
                  spaceId,
                  role: "user",
                  content: message,
                  webSearchUsed: false,
                },
                {
                  spaceId,
                  role: "assistant",
                  content: fullContent,
                  webSearchUsed: usedWebSearch,
                  sources: sources.length > 0 ? (sources as object[]) : undefined,
                },
              ],
            });
            // Update space updatedAt
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
        sendEvent({ type: "delta", delta: "Ocurrió un error. Por favor intenta de nuevo." });
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
