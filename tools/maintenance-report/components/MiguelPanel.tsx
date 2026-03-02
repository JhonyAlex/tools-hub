"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MiguelCheckResult } from "../types";

interface MiguelPanelProps {
  reviewed: number;
  pending: MiguelCheckResult[];
}

export function MiguelPanel({ reviewed, pending }: MiguelPanelProps) {
  const [open, setOpen] = useState(false);
  const allOk = pending.length === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {allOk ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-orange-500" />
            )}
            Revisiones por Miguel
          </CardTitle>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">✅ {reviewed} con Miguel</span>
            {pending.length > 0 && (
              <span className="text-orange-500">⚠️ {pending.length} sin mención</span>
            )}
          </div>
        </div>
      </CardHeader>

      {pending.length > 0 && (
        <CardContent className="space-y-2">
          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? "Ocultar" : `Ver ${pending.length} OTs sin revisión de Miguel`}
          </button>

          {open && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">OT</th>
                    <th className="px-3 py-2 text-left font-medium">Descripción</th>
                    <th className="px-3 py-2 text-left font-medium">Observaciones actuales</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.ordenDeTrabajo} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{r.ordenDeTrabajo}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={r.descripcion}>
                        {r.descripcion || "—"}
                      </td>
                      <td className="px-3 py-2 max-w-[250px] truncate text-muted-foreground" title={r.observaciones}>
                        {r.observaciones || <span className="italic">Vacío</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
