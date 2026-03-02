"use client";

import { forwardRef } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportContainerProps {
  children: React.ReactNode;
  onCopy: () => void;
  copying: boolean;
  copied: boolean;
}

export const ReportContainer = forwardRef<HTMLDivElement, ReportContainerProps>(
  function ReportContainer({ children, onCopy, copying, copied }, ref) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button
            onClick={onCopy}
            disabled={copying}
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 transition-all",
              copied && "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20"
            )}
          >
            {copying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "¡Copiado!" : "Copiar todo"}
          </Button>
        </div>

        <div
          ref={ref}
          className="space-y-6 rounded-xl border border-border bg-background p-6"
        >
          {children}
        </div>
      </div>
    );
  }
);
