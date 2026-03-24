import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { createExportToken } from "../../_store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const format = (body as { format?: "docx" | "pdf" | "md" })?.format ?? "docx";
  if (!["docx", "pdf", "md"].includes(format)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const { id } = await params;
  const exportResult = createExportToken(userId, id, format);
  if (!exportResult) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ export: exportResult });
}
