import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    icon: "h-8 w-8",
    container: "py-8",
    title: "text-sm",
    desc: "text-xs",
  },
  md: {
    icon: "h-12 w-12",
    container: "py-12",
    title: "text-base",
    desc: "text-sm",
  },
  lg: {
    icon: "h-16 w-16",
    container: "py-16",
    title: "text-lg",
    desc: "text-sm",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <div className="mb-4 rounded-2xl bg-muted p-4">
        <Icon className={cn("text-muted-foreground/60", sizes.icon)} />
      </div>
      <h3 className={cn("font-semibold text-foreground", sizes.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-1 text-muted-foreground max-w-sm", sizes.desc)}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Variantes predefinidas para casos comunes
export function EmptyStateReports({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={IconFileText}
      title="No hay reportes guardados"
      description="Sube un archivo CSV para generar tu primer reporte de mantenimiento."
      className={className}
    />
  );
}

// Importar aquí para evitar problemas de dependencia circular
import { FileText } from "lucide-react";
const IconFileText = FileText;
