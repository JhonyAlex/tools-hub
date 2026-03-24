import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { rollbackModelPrompt } from "../../../../_service";

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

  const targetVersion = (body as { targetVersion?: number })?.targetVersion;
  if (typeof targetVersion !== "number" || targetVersion < 1) {
    return NextResponse.json({ error: "targetVersion must be a positive number" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const model = await rollbackModelPrompt(userId, id, targetVersion);
    return NextResponse.json({ model });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to rollback prompt" },
      { status: 400 }
    );
  }
}
