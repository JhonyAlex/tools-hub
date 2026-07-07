import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Ayuda
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información y soporte para Tools Hub.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">¿Qué es Tools Hub?</h2>
        <p className="text-sm text-muted-foreground">
          Tools Hub es un dashboard centralizado para herramientas internas de agencia web.
          Cada herramienta es un módulo independiente que se conecta al sistema a través de un registro.
        </p>

        <h2 className="text-lg font-semibold">Herramientas disponibles</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li><strong>Maintenance Report</strong> — Análisis de órdenes de trabajo de mantenimiento</li>
          <li><strong>Maintenance Report Sem/Mes</strong> — Reportes semanales y mensuales de mano de obra</li>
          <li><strong>AI Report Orchestrator</strong> — Generación de reportes con múltiples agentes IA</li>
          <li><strong>Doc Chat</strong> — Chat interactivo con documentos</li>
          <li><strong>AurisLM</strong> — Espacios de conocimiento con búsqueda semántica</li>
          <li><strong>JSON Formatter</strong> — Formateo y validación de JSON</li>
          <li><strong>Text Counter</strong> — Conteo de caracteres, palabras y párrafos</li>
        </ul>

        <h2 className="text-lg font-semibold">Configuración de IA</h2>
        <p className="text-sm text-muted-foreground">
          Podés configurar proveedores de IA personalizados desde{" "}
          <a href="/settings" className="text-primary underline">Configuración</a>.
          Allí podés agregar tu propia API Key y URL Base dedicada para que todas las herramientas las usen.
        </p>
      </div>
    </div>
  );
}
