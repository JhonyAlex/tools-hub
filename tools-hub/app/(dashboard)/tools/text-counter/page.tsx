import { TextCounterApp } from "@/tools/text-counter";

export default function TextCounterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Contador de Texto
        </h1>
        <p className="mt-1 text-muted-foreground">
          Cuenta palabras, caracteres, oraciones y parrafos de cualquier texto.
        </p>
      </div>
      <TextCounterApp />
    </div>
  );
}
