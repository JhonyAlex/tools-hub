"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function JsonFormatterApp() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function handleFormat() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON invalido");
      setOutput("");
    }
  }

  function handleMinify() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON invalido");
      setOutput("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleFormat}>Formatear</Button>
        <Button variant="outline" onClick={handleMinify}>
          Minificar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Entrada</label>
          <textarea
            className="w-full min-h-[300px] rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder='{"key": "value"}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Resultado</label>
          <textarea
            className="w-full min-h-[300px] rounded-lg border bg-muted/50 p-4 font-mono text-sm resize-y"
            value={output}
            readOnly
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">Error: {error}</p>
      )}
    </div>
  );
}
