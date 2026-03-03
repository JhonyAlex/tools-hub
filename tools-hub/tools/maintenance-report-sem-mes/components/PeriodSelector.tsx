"use client";

import { useState, useEffect } from "react";
import { Calendar, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { PeriodType, DateRange } from "../types";
import {
  getPreviousWeekRange,
  getPreviousMonthRange,
  formatDate,
} from "../lib/dateUtils";

interface PeriodSelectorProps {
  onPeriodChange: (periodType: PeriodType, dateRange: DateRange) => void;
  disabled?: boolean;
}

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function PeriodSelector({ onPeriodChange, disabled }: PeriodSelectorProps) {
  const [periodType, setPeriodType] = useState<PeriodType>("semanal");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (periodType === "semanal") {
      const range = getPreviousWeekRange();
      onPeriodChange("semanal", range);
    } else if (periodType === "mensual") {
      const range = getPreviousMonthRange();
      onPeriodChange("mensual", range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType]);

  useEffect(() => {
    if (periodType === "custom" && customStart && customEnd) {
      const start = new Date(customStart + "T00:00:00");
      const end = new Date(customEnd + "T23:59:59.999");
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        onPeriodChange("custom", { start, end });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStart, customEnd, periodType]);

  const weekRange = getPreviousWeekRange();
  const monthRange = getPreviousMonthRange();

  const options: { value: PeriodType; label: string; desc: string; icon: typeof Calendar }[] = [
    {
      value: "semanal",
      label: "Semanal",
      desc: `${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}`,
      icon: Calendar,
    },
    {
      value: "mensual",
      label: "Mensual",
      desc: `${formatDate(monthRange.start)} - ${formatDate(monthRange.end)}`,
      icon: CalendarRange,
    },
    {
      value: "custom",
      label: "Personalizado",
      desc: "Elige las fechas",
      icon: CalendarRange,
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Período del informe</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = periodType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => !disabled && setPeriodType(opt.value)}
                disabled={disabled}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                {isActive && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {periodType === "custom" && (
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Desde
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd || toInputDate(new Date())}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Hasta
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                max={toInputDate(new Date())}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
