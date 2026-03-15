import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOADS_BASE } from "@/core/lib/uploads";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

// GET /api/auris-lm/spaces/[id]/documents/[docId]/preview
// Serves the file inline (for PDF iframe viewing)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    try {
        const userId = getRequestUserId(req);
        if (!userId) return unauthorizedResponse();

        const { id: spaceId, docId } = await params;

        const doc = await db.aurisLMDocument.findFirst({
            where: { id: docId, spaceId, userId },
        });
        if (!doc) {
            return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
        }

        const fullPath = path.join(UPLOADS_BASE, doc.storedPath);
        const buffer = await readFile(fullPath);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": doc.mimeType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalName)}"`,
                "Content-Length": String(buffer.length),
            },
        });
    } catch (err) {
        console.error("[AurisLM] preview:", err);
        return NextResponse.json({ error: "Error al previsualizar archivo" }, { status: 500 });
    }
}
