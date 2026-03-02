// GET  /api/maintenance-report/reports  - list all saved reports
// POST /api/maintenance-report/reports  - save a new report
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";

export async function GET() {
  try {
    const reports = await db.maintenanceReport.findMany({
      orderBy: { reportDate: "desc" },
      select: {
        id: true,
        reportDate: true,
        csvFileName: true,
        metrics: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[maintenance-report/reports GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportDate, csvFileName, metrics, notes } = body;

    if (!reportDate || !csvFileName || !metrics) {
      return NextResponse.json(
        { error: "reportDate, csvFileName and metrics are required" },
        { status: 400 }
      );
    }

    const report = await db.maintenanceReport.create({
      data: {
        reportDate: new Date(reportDate),
        csvFileName,
        metrics,
        notes: notes ?? "",
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error("[maintenance-report/reports POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
