import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { deleteCaseMapping, getCaseMapping, setCaseMapping } from "../../_service";
import type { CaseMappingEntry } from "@/tools/ai-report-orchestrator/lib/config-types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const { caseId } = await params;
  const mapping = await getCaseMapping(caseId);
  return NextResponse.json({ mapping });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
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

  const data = body as CaseMappingEntry;
  if (!data?.mode || !["inherit", "override"].includes(data.mode)) {
    return NextResponse.json({ error: "mode must be inherit or override" }, { status: 400 });
  }

  try {
    const { caseId } = await params;
    const mapping = await setCaseMapping(userId, caseId, data);
    return NextResponse.json({ mapping });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to set case mapping" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const { caseId } = await params;
  const success = await deleteCaseMapping(userId, caseId);
  return NextResponse.json({ success });
}
