import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { createReport, listReports } from "./_store";

function validatePayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return "Invalid body";
  }

  const data = body as Record<string, unknown>;
  if (typeof data.title !== "string" || !data.title.trim()) {
    return "title is required";
  }

  if (!data.config || typeof data.config !== "object") {
    return "config is required";
  }

  if (!Array.isArray(data.files)) {
    return "files must be an array";
  }

  return null;
}

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const reports = listReports(userId);
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
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

  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const data = body as {
    title: string;
    config: {
      scope: "summary" | "operational" | "strategic";
      detailLevel: "low" | "medium" | "high";
      language: "es" | "en";
      exportFormat: "docx" | "pdf" | "md";
    };
    files: Array<{ name: string; size: number; mimeType: string }>;
  };

  const report = createReport(userId, {
    title: data.title.trim(),
    config: data.config,
    files: data.files,
  });

  return NextResponse.json({ report }, { status: 201 });
}
