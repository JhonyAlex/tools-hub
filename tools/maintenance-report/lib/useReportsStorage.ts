// localStorage-based persistence for saved reports
// Used as a fallback when DATABASE_URL is not configured
import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedReport, ReportMetrics } from "../types";

const STORAGE_KEY = "maintenance-reports-v1";

function loadFromStorage(): SavedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return [];
  }
}

function saveToStorage(reports: SavedReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    console.warn("localStorage write failed");
  }
}

function cuid(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ──────────────────────────────────────────────────────────
// Hook: tries the API first; if the API returns noDb:true
// it transparently falls back to localStorage for all ops.
// ──────────────────────────────────────────────────────────
export function useReportsStorage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const checkedRef = useRef(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance-report/reports");
      const data = await res.json();

      if (data.noDb) {
        // DB not configured – switch to localStorage mode permanently
        setUsingLocalStorage(true);
        setReports(loadFromStorage());
      } else if (res.ok) {
        setUsingLocalStorage(false);
        setReports(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.reports as any[]).map((r) => ({
            id: r.id,
            reportDate: r.reportDate,
            csvFileName: r.csvFileName,
            metrics: r.metrics as ReportMetrics,
            notes: r.notes ?? "",
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }))
        );
      }
    } catch {
      // network error → use localStorage
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

  // ──────────────────────────────────────────
  // Save
  // ──────────────────────────────────────────
  const saveReport = useCallback(
    async (
      reportDate: string,
      csvFileName: string,
      metrics: ReportMetrics,
      notes: string = ""
    ): Promise<void> => {
      if (usingLocalStorage) {
        const now = new Date().toISOString();
        const newReport: SavedReport = {
          id: cuid(),
          reportDate,
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

      const res = await fetch("/api/maintenance-report/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportDate, csvFileName, metrics, notes }),
      });

      const data = await res.json();
      if (data.noDb) {
        // Switched to noDb mid-session
        setUsingLocalStorage(true);
        await saveReport(reportDate, csvFileName, metrics, notes);
        return;
      }
      if (!res.ok) throw new Error(JSON.stringify(data));
      await fetchReports();
    },
    [usingLocalStorage, fetchReports]
  );

  // ──────────────────────────────────────────
  // Delete
  // ──────────────────────────────────────────
  const deleteReport = useCallback(
    async (id: string): Promise<void> => {
      if (usingLocalStorage) {
        const updated = loadFromStorage().filter((r) => r.id !== id);
        saveToStorage(updated);
        setReports(updated);
        return;
      }
      await fetch(`/api/maintenance-report/reports/${id}`, { method: "DELETE" });
      setReports((prev) => prev.filter((r) => r.id !== id));
    },
    [usingLocalStorage]
  );

  // ──────────────────────────────────────────
  // Update notes
  // ──────────────────────────────────────────
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
      await fetch(`/api/maintenance-report/reports/${id}`, {
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
