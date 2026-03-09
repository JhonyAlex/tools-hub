"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { SavedSemMesReport } from "../types";
import { EmptyState } from "@/core/components/EmptyState";
import { CopyableChart } from "./CopyableChart";

interface HistoryChartsProps {
  reports: SavedSemMesReport[];
}

const chartColors = {
  light: { hours: "#3b82f6", ots: "#22c55e", grid: "#e5e7eb", text: "#6b7280" },
  dark: { hours: "#60a5fa", ots: "#4ade80", grid: "#374151", text: "#9ca3af" },
};

export function HistoryCharts({ reports }: HistoryChartsProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? chartColors.dark : chartColors.light;

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Card className="h-[300px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </Card>
      </div>
    );
  }

  if (reports.length < 2) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={TrendingUp}
          title="Datos insuficientes"
          description="Guarda al menos 2 reportes para ver las tendencias."
          size="md"
        />
      </Card>
    );
  }

  const data = [...reports]
    .sort(
      (a, b) =>
        new Date(a.dateRangeStart).getTime() - new Date(b.dateRangeStart).getTime()
    )
    .map((r) => {
      const start = new Date(r.dateRangeStart).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
      return {
        date: start,
        hours: Math.round(r.metrics.totalHours * 10) / 10,
        ots: r.metrics.uniqueOTs,
      };
    });

  return (
    <div className="space-y-4">
      {/* Hours trend */}
      <CopyableChart>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Tendencia de horas</h3>
                <p className="text-sm text-muted-foreground">
                  Últimos {reports.length} reportes
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    border: `1px solid ${colors.grid}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="Horas"
                  stroke={colors.hours}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </CopyableChart>

      {/* OTs trend */}
      <CopyableChart>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">OTs por período</h3>
                <p className="text-sm text-muted-foreground">
                  Evolución del número de OTs
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    border: `1px solid ${colors.grid}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="ots"
                  name="OTs"
                  fill={colors.ots}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </CopyableChart>
    </div>
  );
}
