import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { executeWithFallback, resolveExecutionConfig } from "../_service";

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

  const caseId = (body as { caseId?: string })?.caseId?.trim() || "orchestrator.default";

  try {
    const resolved = await resolveExecutionConfig(caseId);
    const execution = await executeWithFallback(
      userId,
      caseId,
      (body as { payload?: Record<string, unknown> })?.payload
    );

    return NextResponse.json({
      resolved,
      execution,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to execute fallback resolution" },
      { status: 400 }
    );
  }
}
