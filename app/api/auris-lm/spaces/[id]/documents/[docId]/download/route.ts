import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { readFile } from "fs/promises";
import path from "path";

const UPLOADS_BASE = process.env.UPLOADS_DIR ?? "/app/uploads";

// GET /api/auris-lm/spaces/[id]/documents/[docId]/download
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id: spaceId, docId } = await params;

    const doc = await db.aurisLMDocument.findFirst({
      where: { id: docId, spaceId },
    });
    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const fullPath = path.join(UPLOADS_BASE, doc.storedPath);
    const buffer = await readFile(fullPath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    console.error("[AurisLM] download:", err);
    return NextResponse.json({ error: "Error al descargar archivo" }, { status: 500 });
  }
}
