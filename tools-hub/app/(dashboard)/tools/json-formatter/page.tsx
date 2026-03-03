import { JsonFormatterApp } from "@/tools/json-formatter";

export default function JsonFormatterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
        <p className="mt-1 text-muted-foreground">
          Formatea, valida y embellece JSON con deteccion de errores.
        </p>
      </div>
      <JsonFormatterApp />
    </div>
  );
}
