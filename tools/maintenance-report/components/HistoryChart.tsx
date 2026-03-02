"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useTheme } from "@/core/providers/ThemeProvider";
import type { SavedReport } from "../types";
import { EmptyState } from "@/core/components/EmptyState";
import { useState, useEffect } from "react";

interface HistoryChartProps {
  reports: SavedReport[];
}

const chartColors = {
  light: {
    pending: "#f59e0b",
    late: "#ef4444",
    waiting: "#3b82f6",
    progress: "#8b5cf6",
    completed: "#22c55e",
    grid: "#e5e7eb",
    text: "#6b7280",
  },
  dark: {
    pending: "#fbbf24",
    late: "#f87171",
    waiting: "#60a5fa",
    progress: "#a78bfa",
    completed: "#4ade80",
    grid: "#374151",
    text: "#9ca3af",
  },
};

export function HistoryChart({ reports }: HistoryChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? chartColors.dark : chartColors.light;

  // Prevent hydration issues with charts
  if (!mounted) {
    return (
      <div className="space-y-4">
        <Card className="h-[380px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </Card>
        <Card className="h-[300px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </Card>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="border-dashed">
        <EmptyState
          icon={TrendingUp}
          title="Sin datos históricos"
          description="Guarda al menos un reporte para ver la evolución histórica."
          size="md"
        />
      </Card>
    );
  }

  const data = [...reports]
    .sort(
      (a, b) =>
        new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    )
    .map((r) => ({
      date: new Date(r.reportDate).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      }),
      fullDate: new Date(r.reportDate).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      "Pend. Preventivos": r.metrics.pendingPMs,
      "Atrasados": r.metrics.latePMs,
      "En Espera": r.metrics.waitingOTs,
      "En Curso": r.metrics.inProgressOTs,
      "Terminadas": r.metrics.completedYesterday,
    }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.date === label);
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{dataPoint?.fullDate || label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-in">
      {/* Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Evolución de OTs</h3>
              <p className="text-sm text-muted-foreground">
                Tendencia de los últimos {reports.length} reportes
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={colors.grid}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fill: colors.text, fontSize: 11 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 11 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="Pend. Preventivos"
                stroke={colors.pending}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Atrasados"
                stroke={colors.late}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="En Espera"
                stroke={colors.waiting}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="En Curso"
                stroke={colors.progress}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Terminadas"
                stroke={colors.completed}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? "#1f2937" : "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">OTs terminadas por día</h3>
              <p className="text-sm text-muted-foreground">
                Productividad diaria
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={colors.grid}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fill: colors.text, fontSize: 11 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tick={{ fill: colors.text, fontSize: 11 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="Terminadas" 
                fill={colors.completed}
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
