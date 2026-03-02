"use client";

import { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Brain,
  FileText,
  MessageSquare,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIAnalysisResult } from "../types";

interface AIDescriptionsPanelProps {
  results: AIAnalysisResult[];
}

type FilterType = "all" | "problems" | "good";

export function AIDescriptionsPanel({ results }: AIDescriptionsPanelProps) {
  const [filter, setFilter] = useState<FilterType>("problems");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const bad = useMemo(() => 
    results.filter((r) => r.descripcionScore === "bad" || r.observacionesScore === "bad"),
    [results]
  );
  
  const good = useMemo(() => 
    results.filter((r) => r.descripcionScore !== "bad" && r.observacionesScore !== "bad"),
    [results]
  );

  const visible = filter === "all" ? results : filter === "problems" ? bad : good;

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Análisis IA</h3>
              <p className="text-sm text-muted-foreground">
                Calidad de documentación de OTs
              </p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-red-100 dark:bg-red-900/20 px-3 py-1.5">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {bad.length} incompletas
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/20 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {good.length} correctas
              </span>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-muted-foreground mr-1" />
          <FilterButton 
            active={filter === "problems"} 
            onClick={() => setFilter("problems")}
            label="Solo problemáticas"
            count={bad.length}
            variant="destructive"
          />
          <FilterButton 
            active={filter === "good"} 
            onClick={() => setFilter("good")}
            label="Correctas"
            count={good.length}
            variant="success"
          />
          <FilterButton 
            active={filter === "all"} 
            onClick={() => setFilter("all")}
            label="Todas"
            count={results.length}
            variant="default"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500/50 mb-3" />
            <p className="text-muted-foreground">
              No hay OTs que coincidan con el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((r, index) => {
              const dBad = r.descripcionScore === "bad";
              const oBad = r.observacionesScore === "bad";
              const allGood = !dBad && !oBad;
              const isExpanded = expandedItems.has(r.ordenDeTrabajo);

              return (
                <div
                  key={r.ordenDeTrabajo}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-200",
                    allGood
                      ? "border-border bg-muted/20"
                      : "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/10",
                    "hover:shadow-sm"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpanded(r.ordenDeTrabajo)}
                    className="flex w-full items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        allGood 
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {allGood ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-mono text-sm font-medium">
                          OT {r.ordenDeTrabajo}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {dBad && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Descripción
                            </Badge>
                          )}
                          {oBad && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Observaciones
                            </Badge>
                          )}
                          {allGood && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 hover:bg-green-100">
                              Correcto
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Expanded content */}
                  <div className={cn(
                    "grid transition-all duration-200",
                    isExpanded ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
                  )}>
                    <div className="overflow-hidden">
                      <div className="space-y-3 pl-11">
                        <FieldAnalysis
                          icon={FileText}
                          label="Descripción"
                          score={r.descripcionScore}
                          issue={r.descripcionIssue ?? undefined}
                        />
                        <FieldAnalysis
                          icon={MessageSquare}
                          label="Observaciones"
                          score={r.observacionesScore}
                          issue={r.observacionesIssue ?? undefined}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Filter button component
function FilterButton({ 
  active, 
  onClick, 
  label, 
  count,
  variant 
}: { 
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  variant: "default" | "destructive" | "success";
}) {
  const variants = {
    default: active 
      ? "bg-primary text-primary-foreground" 
      : "bg-muted text-muted-foreground hover:bg-muted/80",
    destructive: active
      ? "bg-red-500 text-white"
      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    success: active
      ? "bg-green-500 text-white"
      : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        variants[variant]
      )}
    >
      {label}
      <span className={cn(
        "rounded-full px-1.5 py-0.5 text-xs",
        active ? "bg-white/20" : "bg-background/50"
      )}>
        {count}
      </span>
    </button>
  );
}

// Field analysis component
function FieldAnalysis({
  icon: Icon,
  label,
  score,
  issue,
}: {
  icon: typeof FileText;
  label: string;
  score: string;
  issue?: string;
}) {
  const isBad = score === "bad";

  return (
    <div className={cn(
      "rounded-lg border p-3",
      isBad 
        ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
        : "border-border bg-muted/30"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          isBad
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{label}</span>
            {isBad ? (
              <Badge variant="destructive" className="text-[10px]">Revisar</Badge>
            ) : (
              <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">OK</Badge>
            )}
          </div>
          {isBad && issue && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {issue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
