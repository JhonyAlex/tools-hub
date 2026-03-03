// ============================================================
// REPORTS STORAGE HOOK - DB with localStorage fallback
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedSemMesReport, SemMesReportMetrics } from "../types";

const STORAGE_KEY = "maintenance-report-sem-mes-v1";
const API_BASE = "/api/maintenance-report-sem-mes/reports";

function loadFromStorage(): SavedSemMesReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSemMesReport[];
  } catch {
    return [];
  }
}

function saveToStorage(reports: SavedSemMesReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    console.warn("localStorage write failed");
  }
}

function cuid(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useReportsStorage() {
  const [reports, setReports] = useState<SavedSemMesReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const checkedRef = useRef(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();

      if (data.noDb) {
        setUsingLocalStorage(true);
        setReports(loadFromStorage());
      } else if (res.ok) {
        setUsingLocalStorage(false);
        setReports(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.reports as any[]).map((r) => ({
            id: r.id,
            periodType: r.periodType,
            dateRangeStart: r.dateRangeStart,
            dateRangeEnd: r.dateRangeEnd,
            csvFileName: r.csvFileName,
            metrics: r.metrics as SemMesReportMetrics,
            notes: r.notes ?? "",
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }))
        );
      }
    } catch {
      setUsingLocalStorage(true);
      setReports(loadFromStorage());
    } finally {
      setLoading(false);
      checkedRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const saveReport = useCallback(
    async (
      periodType: string,
      dateRangeStart: string,
      dateRangeEnd: string,
      csvFileName: string,
      metrics: SemMesReportMetrics,
      notes: string = ""
    ): Promise<void> => {
      if (usingLocalStorage) {
        const now = new Date().toISOString();
        const newReport: SavedSemMesReport = {
          id: cuid(),
          periodType,
          dateRangeStart,
          dateRangeEnd,
          csvFileName,
          metrics,
          notes,
          createdAt: now,
          updatedAt: now,
        };
        const updated = [newReport, ...loadFromStorage()];
        saveToStorage(updated);
        setReports(updated);
        return;
      }

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodType,
          dateRangeStart,
          dateRangeEnd,
          csvFileName,
          metrics,
          notes,
        }),
      });

      const data = await res.json();
      if (data.noDb) {
        setUsingLocalStorage(true);
        await saveReport(periodType, dateRangeStart, dateRangeEnd, csvFileName, metrics, notes);
        return;
      }
      if (!res.ok) throw new Error(JSON.stringify(data));
      await fetchReports();
    },
    [usingLocalStorage, fetchReports]
  );

  const deleteReport = useCallback(
    async (id: string): Promise<void> => {
      if (usingLocalStorage) {
        const updated = loadFromStorage().filter((r) => r.id !== id);
        saveToStorage(updated);
        setReports(updated);
        return;
      }
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setReports((prev) => prev.filter((r) => r.id !== id));
    },
    [usingLocalStorage]
  );

  const updateNotes = useCallback(
    async (id: string, notes: string): Promise<void> => {
      if (usingLocalStorage) {
        const updated = loadFromStorage().map((r) =>
          r.id === id ? { ...r, notes, updatedAt: new Date().toISOString() } : r
        );
        saveToStorage(updated);
        setReports(updated);
        return;
      }
      await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, notes } : r))
      );
    },
    [usingLocalStorage]
  );

  return {
    reports,
    loading,
    usingLocalStorage,
    fetchReports,
    saveReport,
    deleteReport,
    updateNotes,
  };
}
