// GET  /api/maintenance-report-sem-mes/reports  - list all saved reports
// POST /api/maintenance-report-sem-mes/reports  - save a new report
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";

const DB_AVAILABLE = !!process.env.DATABASE_URL;

export async function GET() {
  if (!DB_AVAILABLE) {
    return NextResponse.json({ reports: [], noDb: true });
  }
  try {
    const reports = await db.maintenanceReportSemMes.findMany({
      orderBy: { dateRangeStart: "desc" },
      select: {
        id: true,
        periodType: true,
        dateRangeStart: true,
        dateRangeEnd: true,
        csvFileName: true,
        metrics: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/reports GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!DB_AVAILABLE) {
    return NextResponse.json({ noDb: true }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { periodType, dateRangeStart, dateRangeEnd, csvFileName, metrics, notes } = body;

    if (!periodType || !dateRangeStart || !dateRangeEnd || !csvFileName || !metrics) {
      return NextResponse.json(
        { error: "periodType, dateRangeStart, dateRangeEnd, csvFileName and metrics are required" },
        { status: 400 }
      );
    }

    const report = await db.maintenanceReportSemMes.create({
      data: {
        periodType,
        dateRangeStart: new Date(dateRangeStart),
        dateRangeEnd: new Date(dateRangeEnd),
        csvFileName,
        metrics,
        notes: notes ?? "",
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/reports POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
