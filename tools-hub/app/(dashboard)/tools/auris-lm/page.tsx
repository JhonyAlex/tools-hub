import { AurisLMApp } from "@/tools/auris-lm";

export default function AurisLMPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AurisLM</h1>
        <p className="mt-1 text-muted-foreground">
          Workspace RAG · Sube documentos y audios, chatea con la IA usando
          exclusivamente tu contenido.
        </p>
      </div>
      <AurisLMApp />
    </div>
  );
}
