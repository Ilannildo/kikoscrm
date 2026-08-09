import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@kikos/ui/components/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  accent?: "default" | "success" | "danger" | "kikos";
  className?: string;
}

/**
 * Compact KPI card used on the executive dashboard.
 * Displays a single metric with a discreet icon and contextual hint.
 */
export function KpiCard({
  title,
  value,
  icon: Icon,
  hint,
  accent = "default",
  className,
}: KpiCardProps) {
  const iconColor = {
    default: "text-muted-foreground",
    success: "text-emerald-400",
    danger: "text-red-400",
    kikos: "text-[var(--kikos)]",
  }[accent];

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60",
            iconColor
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      {hint && (
        <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
