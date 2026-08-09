import * as React from "react";
import { Card } from "@kikos/ui/components/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function KpiCard({
  title,
  value,
  icon,
  footer,
  className,
  valueClassName,
}: KpiCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight text-foreground",
          valueClassName
        )}
      >
        {value}
      </p>
      {footer && <div className="mt-2">{footer}</div>}
    </Card>
  );
}
