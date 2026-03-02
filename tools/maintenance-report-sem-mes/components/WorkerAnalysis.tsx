"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, BarChart3 } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { WorkerSummary } from "../types";
import { formatHours } from "../lib/timeParser";

interface WorkerAnalysisProps {
  workers: WorkerSummary[];
}

const chartColors = {
  light: { hours: "#22c55e", ots: "#3b82f6", grid: "#e5e7eb", text: "#6b7280" },
  dark: { hours: "#4ade80", ots: "#60a5fa", grid: "#374151", text: "#9ca3af" },
};

export function WorkerAnalysis({ workers }: WorkerAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? chartColors.dark : chartColors.light;

  if (workers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Análisis por Trabajador</h3>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Trabajador</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">N OTs</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Horas Totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workers.map((w) => (
                  <tr key={w.worker} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{w.worker}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {w.otCount}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {formatHours(w.totalHours)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {mounted && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">Carga de trabajo por trabajador</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={workers.map((w) => ({
                  name: w.worker,
                  hours: Math.round(w.totalHours * 100) / 100,
                  ots: w.otCount,
                }))}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    name === "hours" ? formatHours(Number(value)) : value,
                    name === "hours" ? "Horas" : "OTs",
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  yAxisId="left"
                  dataKey="hours"
                  name="Horas"
                  fill={colors.hours}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  yAxisId="right"
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
      )}
    </div>
  );
}
