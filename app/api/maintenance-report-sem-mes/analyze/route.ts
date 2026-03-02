// POST /api/maintenance-report-sem-mes/analyze
// Generates AI executive summary and conclusions
import { NextRequest, NextResponse } from "next/server";
import { generateAIReport } from "@/tools/maintenance-report-sem-mes/lib/aiAnalysis";
import type { ReportAggregations } from "@/tools/maintenance-report-sem-mes/types";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured in environment" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const aggregations: ReportAggregations = body.aggregations;

    if (!aggregations) {
      return NextResponse.json(
        { error: "aggregations object required" },
        { status: 400 }
      );
    }

    const aiContent = await generateAIReport(aggregations, apiKey);

    return NextResponse.json({ aiContent });
  } catch (err) {
    console.error("[maintenance-report-sem-mes/analyze]", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
