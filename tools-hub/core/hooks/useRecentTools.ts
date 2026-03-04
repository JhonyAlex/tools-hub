"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tools-hub-recent";
const MAX_RECENT = 12;

interface RecentEntry {
  slug: string;
  visitedAt: number;
}

export function useRecentTools() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      /* ignore */
    }
  }, [recent, mounted]);

  const trackVisit = useCallback((slug: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((e) => e.slug !== slug);
      return [{ slug, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const recentSlugs = recent.map((e) => e.slug);

  return { recentSlugs, trackVisit, mounted };
}
