import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "page";
}

const sizeMap = {
  sm: {
    container: "py-8 px-4",
    iconWrapper: "h-12 w-12 mb-3",
    icon: "h-6 w-6",
    title: "text-sm",
    desc: "text-xs max-w-[200px]",
  },
  md: {
    container: "py-12 px-6",
    iconWrapper: "h-16 w-16 mb-4",
    icon: "h-8 w-8",
    title: "text-base",
    desc: "text-sm max-w-sm",
  },
  lg: {
    container: "py-16 px-8",
    iconWrapper: "h-20 w-20 mb-5",
    icon: "h-10 w-10",
    title: "text-lg",
    desc: "text-sm max-w-md",
  },
};

const variantStyles = {
  default: "",
  card: "rounded-2xl border bg-card/50",
  page: "min-h-[400px] rounded-2xl border bg-gradient-to-br from-muted/50 to-background",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
  variant = "default",
}: EmptyStateProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        variantStyles[variant],
        className
      )}
    >
      {/* Icon with animated gradient background */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
          "border border-primary/10 shadow-sm",
          sizes.iconWrapper
        )}
      >
        <Icon className={cn("relative z-10 text-primary/60", sizes.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground", sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn("mt-2 text-muted-foreground", sizes.desc)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common use cases
interface EmptyStatePresetProps {
  className?: string;
  onAction?: () => void;
}

export function EmptyStateSearch({ className, onAction }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={ArrowRight}
      title="No se encontraron resultados"
      description="Prueba con otros términos de búsqueda o revisa la ortografía."
      size="md"
      variant="card"
      className={className}
      action={
        onAction && (
          <Button variant="outline" size="sm" onClick={onAction}>
            Limpiar búsqueda
          </Button>
        )
      }
    />
  );
}

export function EmptyStateError({ className, onAction }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={ArrowRight}
      title="Algo salió mal"
      description="Hubo un error al cargar los datos. Por favor, intenta de nuevo."
      size="md"
      variant="card"
      className={className}
      action={
        onAction && (
          <Button variant="default" size="sm" onClick={onAction}>
            Reintentar
          </Button>
        )
      }
    />
  );
}

export function EmptyStateSuccess({ className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={ArrowRight}
      title="¡Todo listo!"
      description="No hay más elementos pendientes."
      size="md"
      variant="card"
      className={className}
    />
  );
}
