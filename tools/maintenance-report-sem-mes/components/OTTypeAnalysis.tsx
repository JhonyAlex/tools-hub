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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { OTTypeSummary } from "../types";
import { formatHours } from "../lib/timeParser";

interface OTTypeAnalysisProps {
  otTypes: OTTypeSummary[];
}

const PIE_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6",
];

const chartColors = {
  light: { bar: "#f59e0b", grid: "#e5e7eb", text: "#6b7280" },
  dark: { bar: "#fbbf24", grid: "#374151", text: "#9ca3af" },
};

export function OTTypeAnalysis({ otTypes }: OTTypeAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? chartColors.dark : chartColors.light;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Análisis por Tipo de OT</h3>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo de OT</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Cantidad</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Horas Totales</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Tiempo Medio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {otTypes.map((t) => (
                  <tr key={t.tipoDeOT} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{t.tipoDeOT}</td>
                    <td className="px-4 py-2 text-right">{t.otCount}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {formatHours(t.totalHours)}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {formatHours(t.avgHours)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {mounted && otTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Distribución por tipo de OT</p>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={otTypes.map((t) => ({
                      name: t.tipoDeOT,
                      value: t.otCount,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={true}
                  >
                    {otTypes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      border: `1px solid ${colors.grid}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar chart: avg time */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Tiempo promedio por tipo</p>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={otTypes.map((t) => ({
                    name: t.tipoDeOT.length > 12 ? t.tipoDeOT.slice(0, 12) + "..." : t.tipoDeOT,
                    avg: Math.round(t.avgHours * 100) / 100,
                  }))}
                  margin={{ top: 5, right: 10, left: -10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: colors.text, fontSize: 10 }}
                    axisLine={{ stroke: colors.grid }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${formatHours(Number(value))}`, "Tiempo medio"]}
                  />
                  <Bar dataKey="avg" name="Horas promedio" fill={colors.bar} radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
