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
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Cpu, BarChart3, Brain } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { AssetSummary, AIReportContent } from "../types";
import { formatHours } from "../lib/timeParser";

interface AssetAnalysisProps {
  assets: AssetSummary[];
  aiContent: AIReportContent | null;
}

const chartColors = {
  light: { bar: "#3b82f6", barAlt: "#8b5cf6", grid: "#e5e7eb", text: "#6b7280" },
  dark: { bar: "#60a5fa", barAlt: "#a78bfa", grid: "#374151", text: "#9ca3af" },
};

export function AssetAnalysis({ assets, aiContent }: AssetAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? chartColors.dark : chartColors.light;

  const top10ByHours = assets.slice(0, 10);
  const top10ByOT = [...assets].sort((a, b) => b.otCount - a.otCount).slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Análisis por Activos</h3>
      </div>

      {/* Table: by hours */}
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground">
            Activos por horas dedicadas (desc.)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Activo</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Horas</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">OTs</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Reg. M.O.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top10ByHours.map((a) => (
                  <tr key={a.activo} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{a.activo}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {formatHours(a.totalHours)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {a.otCount}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {a.recordCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart: hours by asset (horizontal bars) */}
      {mounted && top10ByHours.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Horas por activo</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(250, top10ByHours.length * 45)}>
              <BarChart
                data={top10ByHours.map((a) => ({
                  name: a.activo.length > 25 ? a.activo.slice(0, 25) + "..." : a.activo,
                  fullName: a.activo,
                  hours: Math.round(a.totalHours * 100) / 100,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
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
                  formatter={(value: any) => [`${formatHours(Number(value))}`, "Horas"]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName ?? label}
                />
                <Bar dataKey="hours" fill={colors.bar} radius={[0, 6, 6, 0]} maxBarSize={40}>
                  <LabelList
                    dataKey="hours"
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
      )}

      {/* Chart: OTs by asset (horizontal bars) */}
      {mounted && top10ByOT.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-medium">Número de OTs por activo</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(250, top10ByOT.length * 45)}>
              <BarChart
                data={top10ByOT.map((a) => ({
                  name: a.activo.length > 25 ? a.activo.slice(0, 25) + "..." : a.activo,
                  fullName: a.activo,
                  ots: a.otCount,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: colors.text, fontSize: 11 }}
                  axisLine={{ stroke: colors.grid }}
                  allowDecimals={false}
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
                  labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName ?? label}
                />
                <Bar dataKey="ots" name="OTs" fill={colors.barAlt} radius={[0, 6, 6, 0]} maxBarSize={40}>
                  <LabelList
                    dataKey="ots"
                    position="right"
                    style={{ fill: colors.text, fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {aiContent?.assetAnalysis && (
        <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-900/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiContent.assetAnalysis}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
