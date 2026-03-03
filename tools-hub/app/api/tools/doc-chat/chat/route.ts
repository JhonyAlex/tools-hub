import { NextRequest } from "next/server";
import { db } from "@/core/lib/db";

interface ChatRequestBody {
    sessionId: string;
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
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

export async function POST(req: NextRequest) {
    const body = (await req.json()) as ChatRequestBody;
    const { sessionId, message, history = [] } = body;

    if (!sessionId || !message?.trim()) {
        return new Response(
            JSON.stringify({ error: "sessionId y message son requeridos." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                // Fetch session with system prompt
                const session = await db.docChatSession.findUnique({
                    where: { id: sessionId },
                    select: { extractedText: true, systemPrompt: true, fileName: true },
                });

                if (!session) {
                    sendEvent({ type: "delta", delta: "Error: Sesión no encontrada." });
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                    return;
                }

                // Build system prompt with document context
                const roleContext = session.systemPrompt
                    ? `${session.systemPrompt}\n\n`
                    : "Eres un asistente experto que analiza documentos. ";

                // Use up to 12000 chars of document for context
                const docSnippet = session.extractedText.slice(0, 12000);

                const systemPrompt = `${roleContext}
REGLAS:
1. Responde basándote EXCLUSIVAMENTE en el contenido del documento proporcionado.
2. Si la respuesta no se encuentra en el documento, di exactamente: "Esa información no está en el documento."
3. Sé BREVE y directo: responde en 2-4 oraciones como máximo. Solo amplía tu respuesta si el usuario te lo pide explícitamente (e.g. "explica más", "dame más detalle").
4. Usa listas con viñetas cuando sea más eficiente que párrafos largos.
5. Cita secciones relevantes del documento cuando sea apropiado.
6. NO inventes información que no esté en el documento.
7. Responde en el idioma de la pregunta del usuario.
8. Puedes usar formato Markdown (negritas, listas, código) para mejorar la legibilidad.

DOCUMENTO (${session.fileName}):
${docSnippet}${session.extractedText.length > 12000 ? "\n\n[... documento truncado por longitud ...]" : ""}`.trim();

                // Build messages
                const openRouterMessages = [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
                    { role: "user", content: message },
                ];

                // Call OpenRouter
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
                        "X-Title": "DocChat",
                    },
                    body: JSON.stringify({
                        model: "deepseek/deepseek-chat",
                        messages: openRouterMessages,
                        stream: true,
                        temperature: 0.2,
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

                // Stream response
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
                            // ignore parse errors
                        }
                    }
                }

                controller.enqueue(encoder.encode("data: [DONE]\n\n"));

                // Persist messages in background
                void (async () => {
                    try {
                        await db.docChatMessage.createMany({
                            data: [
                                { sessionId, role: "user", content: message },
                                { sessionId, role: "assistant", content: fullContent },
                            ],
                        });
                        await db.docChatSession.update({
                            where: { id: sessionId },
                            data: { updatedAt: new Date() },
                        });
                    } catch (dbErr) {
                        console.error("[DocChat] DB persist error:", dbErr);
                    }
                })();
            } catch (err) {
                console.error("[DocChat] chat stream error:", err);
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
