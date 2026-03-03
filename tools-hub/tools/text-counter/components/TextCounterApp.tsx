"use client";

import { useState } from "react";
import { Copy, Trash2, FileText, Type, Clock, AlignLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolLayout, ToolInputPanel, ToolOutputPanel, ToolSection } from "@/core/components/ToolLayout";
import { analyzeText } from "../lib/analyze";

export function TextCounterApp() {
  const [text, setText] = useState("");
  const stats = analyzeText(text);

  const handleClear = () => setText("");
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const statCards = [
    { label: "Palabras", value: stats.words, icon: Type },
    { label: "Caracteres", value: stats.characters, icon: FileText },
    { label: "Sin espacios", value: stats.charactersNoSpaces, icon: FileText },
    { label: "Oraciones", value: stats.sentences, icon: AlignLeft },
    { label: "Párrafos", value: stats.paragraphs, icon: AlignLeft },
    { label: "Tiempo de lectura", value: `${stats.readingTimeMinutes} min`, icon: Clock },
  ];

  return (
    <ToolLayout
      sidebar={
        <ToolInputPanel title="Configuración" description="Opciones de análisis">
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Tiempo de lectura</p>
              <p>Calculado a velocidad promedio de 200 palabras por minuto.</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Conteo de palabras</p>
              <p>Detecta palabras separadas por espacios o saltos de línea.</p>
            </div>
          </div>
        </ToolInputPanel>
      }
    >
      <div className="space-y-6">
        {/* Text Input */}
        <ToolSection variant="subtle" className="p-0">
          <div className="relative">
            <textarea
              className="w-full min-h-[250px] bg-transparent p-5 text-sm leading-relaxed resize-y focus:outline-none"
              placeholder="Pega o escribe tu texto aquí para analizar..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
              <span className="text-xs text-muted-foreground">
                {stats.characters} caracteres
              </span>
              <div className="flex items-center gap-2">
                {text && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Limpiar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </ToolSection>

        {/* Stats Grid */}
        <ToolOutputPanel
          title="Estadísticas"
          description="Resumen del análisis de tu texto"
          empty={!text}
          emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
          emptyTitle="Sin texto"
          emptyDescription="Escribe o pega texto en el área de entrada para ver las estadísticas."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ToolOutputPanel>
      </div>
    </ToolLayout>
  );
}
