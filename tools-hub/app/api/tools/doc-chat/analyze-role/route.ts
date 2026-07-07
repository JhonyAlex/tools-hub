import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { getActiveAIProvider } from "@/core/lib/ai-provider";

interface OpenRouterResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = (await req.json()) as { sessionId: string };

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId requerido." }, { status: 400 });
        }

        const session = await db.docChatSession.findUnique({
            where: { id: sessionId },
            select: { extractedText: true, fileName: true },
        });

        if (!session) {
            return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
        }

        const provider = await getActiveAIProvider();

        // Take first ~3000 chars for role analysis (cost-effective)
        const sampleText = session.extractedText.slice(0, 3000);

        const rolePrompt = `Analiza el siguiente fragmento de un documento llamado "${session.fileName}" y genera un system prompt corto (máximo 2-3 oraciones) que defina el ROL que una IA debería asumir al responder preguntas sobre este documento.

El rol debe ser específico al contenido del documento. Ejemplos:
- Si es un contrato: "Eres el contrato de arrendamiento firmado en [fecha]. Responde como un asesor legal que defiende las cláusulas de este contrato."
- Si es un manual técnico: "Eres el manual técnico de [producto]. Responde como un ingeniero experto en este sistema."
- Si es un artículo académico: "Eres el artículo '[título]'. Responde como un investigador que explica los hallazgos de este estudio."

Responde SOLO con el system prompt, sin explicaciones adicionales.

FRAGMENTO DEL DOCUMENTO:
${sampleText}`;

        const orRes = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${provider.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tools-hub.app",
                "X-Title": "DocChat",
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [{ role: "user", content: rolePrompt }],
                temperature: 0.3,
                max_tokens: 256,
            }),
        });

        if (!orRes.ok) {
            const errText = await orRes.text().catch(() => "unknown");
            console.error("[DocChat] OpenRouter role analysis error:", orRes.status, errText);
            return NextResponse.json(
                { error: `Error del servidor de IA: ${orRes.status}` },
                { status: 502 }
            );
        }

        const data = (await orRes.json()) as OpenRouterResponse;
        const systemPrompt = data.choices?.[0]?.message?.content?.trim() ?? null;

        if (systemPrompt) {
            await db.docChatSession.update({
                where: { id: sessionId },
                data: { systemPrompt },
            });
        }

        return NextResponse.json({ systemPrompt });
    } catch (err) {
        console.error("[DocChat] analyze-role error:", err);
        return NextResponse.json(
            { error: "Error al analizar el rol del documento." },
            { status: 500 }
        );
    }
}
