// POST /api/maintenance-report/analyze
// Analyzes OT descriptions using OpenRouter AI
import { NextRequest, NextResponse } from "next/server";
import { analyzeDescriptions } from "@/tools/maintenance-report/lib/aiAnalysis";
import type { OTRecord } from "@/tools/maintenance-report/types";

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
    const records: OTRecord[] = body.records;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "records array required" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const results = await analyzeDescriptions(records, apiKey, currentYear);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[maintenance-report/analyze]", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
