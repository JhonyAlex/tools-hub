"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSource } from "../lib/useChat";

interface SourcesPanelProps {
  sources: ChatSource[];
  webSearchUsed: boolean;
}

export function SourcesPanel({ sources, webSearchUsed }: SourcesPanelProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0 && !webSearchUsed) return null;

  return (
    <div className="mt-2 rounded-lg border border-border/60 overflow-hidden text-xs">
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-muted-foreground hover:bg-accent/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          <FileText className="size-3" />
          <span>
            {sources.length} fuente{sources.length !== 1 ? "s" : ""}
            {webSearchUsed && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-blue-500">
                <Globe className="size-3" /> + web
              </span>
            )}
          </span>
        </div>
        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
      {open && (
        <div className="divide-y divide-border/50 max-h-48 overflow-y-auto bg-muted/20">
          {sources.map((src, i) => (
            <div key={i} className="px-3 py-2">
              <p className={cn("font-medium text-foreground/80 mb-0.5 flex items-center gap-1")}>
                <FileText className="size-3 shrink-0" />
                {src.docName}
              </p>
              <p className="text-muted-foreground leading-relaxed line-clamp-3 pl-4">
                {src.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
