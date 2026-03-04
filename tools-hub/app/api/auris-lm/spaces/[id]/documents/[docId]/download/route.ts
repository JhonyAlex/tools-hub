import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOADS_BASE } from "@/core/lib/uploads";

// GET /api/auris-lm/spaces/[id]/documents/[docId]/download
// Supports ?inline=true for serving files inline (PDF viewer)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id: spaceId, docId } = await params;
    const inline = req.nextUrl.searchParams.get("inline") === "true";

    const doc = await db.aurisLMDocument.findFirst({
      where: { id: docId, spaceId },
    });
    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const fullPath = path.join(UPLOADS_BASE, doc.storedPath);
    const buffer = await readFile(fullPath);

    const disposition = inline
      ? `inline; filename="${encodeURIComponent(doc.originalName)}"`
      : `attachment; filename="${encodeURIComponent(doc.originalName)}"`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": disposition,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    console.error("[AurisLM] download:", err);
    return NextResponse.json({ error: "Error al descargar archivo" }, { status: 500 });
  }
}
