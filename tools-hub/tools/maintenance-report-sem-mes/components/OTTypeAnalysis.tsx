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
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings, PieChart as PieIcon, BarChart3, Brain } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { OTTypeSummary, AIReportContent } from "../types";
import { formatHours } from "../lib/timeParser";
import { CopyableChart } from "./CopyableChart";

interface OTTypeAnalysisProps {
  otTypes: OTTypeSummary[];
  aiContent: AIReportContent | null;
}

const PIE_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6",
];

const chartColors = {
  light: { bar: "#f59e0b", grid: "#e5e7eb", text: "#6b7280" },
  dark: { bar: "#fbbf24", grid: "#374151", text: "#9ca3af" },
};

export function OTTypeAnalysis({ otTypes, aiContent }: OTTypeAnalysisProps) {
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
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">OTs</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Reg. M.O.</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Horas Totales</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Tiempo Medio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {otTypes.map((t) => (
                  <tr key={t.tipoDeOT} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{t.tipoDeOT}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {t.otCount}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {t.recordCount}
                    </td>
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
        <div className="space-y-4">
          {/* Pie chart - full width for label space */}
          <CopyableChart>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Distribución por tipo de OT</p>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ overflow: "visible" }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={otTypes.map((t) => ({
                          name: t.tipoDeOT,
                          value: t.otCount,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        dataKey="value"
                        label={({ percent }) =>
                          `${((percent ?? 0) * 100).toFixed(0)}%`
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, name: any) => [`${value} OTs`, name]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11 }}
                        iconType="circle"
                        iconSize={8}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </CopyableChart>

          {/* Bar chart: avg time - horizontal layout for readability */}
          <CopyableChart>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium">Tiempo promedio por tipo de OT</p>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(250, otTypes.length * 45)}>
                  <BarChart
                    data={otTypes.map((t) => ({
                      name: t.tipoDeOT.length > 22 ? t.tipoDeOT.slice(0, 22) + "..." : t.tipoDeOT,
                      fullName: t.tipoDeOT,
                      avg: Math.round(t.avgHours * 100) / 100,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: colors.text, fontSize: 11 }}
                      axisLine={{ stroke: colors.grid }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: colors.text, fontSize: 11 }}
                      width={180}
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName ?? label}
                    />
                    <Bar dataKey="avg" name="Horas promedio" fill={colors.bar} radius={[0, 6, 6, 0]} maxBarSize={40}>
                      <LabelList
                        dataKey="avg"
                        position="right"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any) => formatHours(Number(v))}
                        style={{ fill: colors.text, fontSize: 10 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </CopyableChart>
        </div>
      )}

      {/* AI Analysis */}
      {aiContent?.otTypeAnalysis && (
        <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-900/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiContent.otTypeAnalysis}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
