// POST /api/maintenance-report-sem-mes/analyze
// Generates AI executive summary and conclusions
import { NextRequest, NextResponse } from "next/server";
import { generateAIReport } from "@/tools/maintenance-report-sem-mes/lib/aiAnalysis";
import type { ReportAggregations } from "@/tools/maintenance-report-sem-mes/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const aggregations: ReportAggregations = body.aggregations;

    if (!aggregations) {
      return NextResponse.json(
        { error: "aggregations object required" },
        { status: 400 }
      );
    }

    const aiContent = await generateAIReport(aggregations);

    return NextResponse.json({ aiContent });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/analyze]", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
