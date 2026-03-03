import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { extractText } from "@/tools/doc-chat/lib/textExtractor";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
        }

        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "El archivo excede el límite de 20MB." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "application/octet-stream";
        const fileName = file.name;

        // Extract text
        const extractedText = await extractText(buffer, mimeType, fileName);

        // Create session in DB
        const session = await db.docChatSession.create({
            data: {
                fileName,
                mimeType,
                extractedText,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            fileName: session.fileName,
            text: session.extractedText,
        });
    } catch (err) {
        console.error("[DocChat] upload error:", err);
        const message = err instanceof Error ? err.message : "Error al procesar el archivo.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
