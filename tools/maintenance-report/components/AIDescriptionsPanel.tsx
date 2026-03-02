"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIAnalysisResult } from "../types";

interface AIDescriptionsPanelProps {
  results: AIAnalysisResult[];
}

export function AIDescriptionsPanel({ results }: AIDescriptionsPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const bad = results.filter(
    (r) => r.descripcionScore === "bad" || r.observacionesScore === "bad"
  );
  const good = results.filter(
    (r) => r.descripcionScore !== "bad" && r.observacionesScore !== "bad"
  );

  const visible = showAll ? results : bad;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            Análisis IA – Calidad de documentación
          </CardTitle>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle size={13} /> {bad.length} incompletas
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 size={13} /> {good.length} correctas
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay OTs no-preventivas del año actual para analizar.
          </p>
        )}

        {visible.map((r) => {
          const dBad = r.descripcionScore === "bad";
          const oBad = r.observacionesScore === "bad";
          const allGood = !dBad && !oBad;

          return (
            <div
              key={r.ordenDeTrabajo}
              className={`rounded-lg border p-3 text-sm space-y-1.5 ${
                allGood
                  ? "border-border bg-muted/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {allGood ? (
                  <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                ) : (
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                )}
                <span>OT {r.ordenDeTrabajo}</span>
              </div>

              <div className="ml-5 space-y-1">
                <FieldLine
                  label="Descripción"
                  score={r.descripcionScore}
                  issue={r.descripcionIssue}
                />
                <FieldLine
                  label="Observaciones"
                  score={r.observacionesScore}
                  issue={r.observacionesIssue}
                />
              </div>
            </div>
          );
        })}

        {results.length > 0 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp size={14} /> Mostrar solo problemáticas
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Mostrar todas ({results.length})
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function FieldLine({
  label,
  score,
  issue,
}: {
  label: string;
  score: "good" | "bad" | "unknown";
  issue: string | null;
}) {
  const icon =
    score === "good" ? "✅" : score === "bad" ? "❌" : "⏳";
  return (
    <div className="flex gap-1.5">
      <span>{icon}</span>
      <span>
        <span className="font-medium">{label}:</span>{" "}
        {issue ? (
          <span className="text-red-600 dark:text-red-400">{issue}</span>
        ) : (
          <span className="text-muted-foreground">Correcto</span>
        )}
      </span>
    </div>
  );
}
