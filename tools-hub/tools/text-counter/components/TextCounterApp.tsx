"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeText } from "../lib/analyze";

export function TextCounterApp() {
  const [text, setText] = useState("");
  const stats = analyzeText(text);

  const statItems = [
    { label: "Palabras", value: stats.words },
    { label: "Caracteres", value: stats.characters },
    { label: "Sin espacios", value: stats.charactersNoSpaces },
    { label: "Oraciones", value: stats.sentences },
    { label: "Parrafos", value: stats.paragraphs },
    { label: "Lectura (min)", value: stats.readingTimeMinutes },
  ];

  return (
    <div className="space-y-6">
      <textarea
        className="w-full min-h-[200px] rounded-lg border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        placeholder="Pega o escribe tu texto aqui..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="p-4">
              <p className="text-2xl font-bold">{item.value}</p>
              <CardTitle className="text-xs text-muted-foreground font-normal">
                {item.label}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
