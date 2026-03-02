// PATCH  /api/maintenance-report/reports/[id]  - update notes/metrics
// DELETE /api/maintenance-report/reports/[id]  - delete report
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { notes, metrics } = body;

    const updateData: Record<string, unknown> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (metrics !== undefined) updateData.metrics = metrics;

    const report = await db.maintenanceReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ report });
  } catch (err) {
    console.error("[maintenance-report/reports PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.maintenanceReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[maintenance-report/reports DELETE]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
