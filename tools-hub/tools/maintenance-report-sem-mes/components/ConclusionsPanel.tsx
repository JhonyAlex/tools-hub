"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Lightbulb } from "lucide-react";
import type { AIReportContent } from "../types";

interface ConclusionsPanelProps {
  aiContent: AIReportContent;
}

export function ConclusionsPanel({ aiContent }: ConclusionsPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Conclusiones y Recomendaciones</h3>

      {/* Conclusions */}
      {aiContent.conclusions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="font-medium">Hallazgos clave</p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiContent.conclusions.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {aiContent.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <p className="font-medium">Recomendaciones prácticas</p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiContent.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
