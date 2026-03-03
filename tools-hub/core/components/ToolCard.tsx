import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ToolManifest } from "@/core/types/tool.types";
import { CATEGORY_LABELS } from "@/core/types/tool.types";

interface ToolCardProps {
  tool: ToolManifest;
}

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  return Icon ? <Icon className="h-8 w-8" /> : <LucideIcons.Box className="h-8 w-8" />;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={tool.path}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="rounded-lg border p-2.5 text-muted-foreground group-hover:text-primary transition-colors">
              {getIcon(tool.icon)}
            </div>
            <div className="flex gap-1.5">
              {tool.status === "beta" && (
                <Badge variant="secondary">Beta</Badge>
              )}
              {tool.status === "maintenance" && (
                <Badge variant="destructive">Mantenimiento</Badge>
              )}
              <Badge variant="outline">{CATEGORY_LABELS[tool.category]}</Badge>
            </div>
          </div>
          <CardTitle className="mt-3 text-lg">{tool.name}</CardTitle>
          <CardDescription>{tool.description}</CardDescription>
          <div className="mt-2 flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
