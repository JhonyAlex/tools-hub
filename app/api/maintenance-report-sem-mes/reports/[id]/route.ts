// PATCH  /api/maintenance-report-sem-mes/reports/[id]  - update notes
// DELETE /api/maintenance-report-sem-mes/reports/[id]  - delete report
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";

const DB_AVAILABLE = !!process.env.DATABASE_URL;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!DB_AVAILABLE) return NextResponse.json({ noDb: true }, { status: 503 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { notes, metrics } = body;

    const updateData: Record<string, unknown> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (metrics !== undefined) updateData.metrics = metrics;

    const report = await db.maintenanceReportSemMes.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ report });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/reports PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!DB_AVAILABLE) return NextResponse.json({ noDb: true }, { status: 503 });
  try {
    const { id } = await params;
    await db.maintenanceReportSemMes.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/reports DELETE]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
