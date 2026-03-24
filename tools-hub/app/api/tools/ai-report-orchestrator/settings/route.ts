import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import {
  getOrchestratorSettings,
  upsertOrchestratorSettings,
} from "../_settings-service";
import {
  AGENT_ROLES,
  type OrchestratorSettingsInput,
} from "@/tools/ai-report-orchestrator/lib/settings-types";

function parsePayload(body: unknown): Partial<OrchestratorSettingsInput> {
  if (!body || typeof body !== "object") {
    return {};
  }

  const data = body as Record<string, unknown>;

  return {
    globalProvider:
      typeof data.globalProvider === "string" ? data.globalProvider : undefined,
    defaultPreferences:
      data.defaultPreferences && typeof data.defaultPreferences === "object"
        ? (data.defaultPreferences as Record<string, unknown>)
        : undefined,
    apiKeys:
      data.apiKeys && typeof data.apiKeys === "object"
        ? (Object.fromEntries(
            Object.entries(data.apiKeys as Record<string, unknown>).filter(
              ([, value]) => typeof value === "string"
            ) as Array<[string, string]>
          ) as Record<string, string>)
        : undefined,
    agents: Array.isArray(data.agents)
      ? (data.agents
          .map((agent) => {
            if (!agent || typeof agent !== "object") {
              return null;
            }

            const entry = agent as Record<string, unknown>;
            if (
              typeof entry.role !== "string" ||
              typeof entry.provider !== "string" ||
              typeof entry.model !== "string" ||
              typeof entry.systemPrompt !== "string"
            ) {
              return null;
            }

            if (!AGENT_ROLES.includes(entry.role as (typeof AGENT_ROLES)[number])) {
              return null;
            }

            return {
              role: entry.role as (typeof AGENT_ROLES)[number],
              provider: entry.provider,
              model: entry.model,
              systemPrompt: entry.systemPrompt,
            };
          })
          .filter(Boolean) as OrchestratorSettingsInput["agents"])
      : undefined,
  };
}

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const settings = await getOrchestratorSettings(userId);
  return NextResponse.json({ settings });
}

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

  try {
    const settings = await upsertOrchestratorSettings(userId, parsePayload(body));
    return NextResponse.json({ settings }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save settings" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

  try {
    const settings = await upsertOrchestratorSettings(userId, parsePayload(body));
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update settings" },
      { status: 400 }
    );
  }
}
