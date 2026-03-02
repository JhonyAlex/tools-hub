import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { unlink } from "fs/promises";
import path from "path";

const UPLOADS_BASE = process.env.UPLOADS_DIR ?? "/app/uploads";

// DELETE /api/auris-lm/spaces/[id]/documents/[docId]
export async function DELETE(
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
