import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { unlink } from "fs/promises";
import path from "path";
import { UPLOADS_BASE } from "@/core/lib/uploads";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

// GET /api/auris-lm/spaces/[id]/documents/[docId] – fetch doc with extracted text
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
    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  } catch (err) {
    console.error("[AurisLM] GET document:", err);
    return NextResponse.json({ error: "Error al obtener documento" }, { status: 500 });
  }
}

// DELETE /api/auris-lm/spaces/[id]/documents/[docId]
export async function DELETE(
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

    // Delete physical file
    const fullPath = path.join(UPLOADS_BASE, doc.storedPath);
    try {
      await unlink(fullPath);
    } catch {
      // File may already be gone, ignore
    }

    // DB cascade handles chunks
    await db.aurisLMDocument.delete({ where: { id: docId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[AurisLM] DELETE document:", err);
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 });
  }
}
