import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@kikos/ui/components/card";
import { Badge } from "@kikos/ui/components/badge";
import { formatCompactCurrency } from "@kikos/shared/src/utils/format";
import type { PipelineItemDto } from "@kikos/shared";
import { DealStatus } from "@kikos/shared";
import { DEAL_STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

interface PipelineSummaryProps {
  items: PipelineItemDto[];
}

const STATUS_DOT_CLASS: Record<DealStatus, string> = {
  [DealStatus.new]: "bg-sky-400",
  [DealStatus.in_progress]: "bg-amber-400",
  [DealStatus.won]: "bg-emerald-400",
  [DealStatus.lost]: "bg-red-400",
};

export function PipelineSummary({ items }: PipelineSummaryProps) {
  const total = items.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distribution bar */}
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/60">
          {items.map((item) => {
            if (item.count === 0) return null;
            const width = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div
                key={item.status}
                style={{ width: `${width}%` }}
                className={cn("h-full", STATUS_DOT_CLASS[item.status])}
              />
            );
          })}
        </div>

        {/* Status rows */}
        <ul className="space-y-1">
          {items.map((item) => {
            const meta = DEAL_STATUS_META[item.status];
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <li
                key={item.status}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      STATUS_DOT_CLASS[item.status]
                    )}
                  />
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {meta.label}
                  </span>
                  <Badge
                    variant={meta.badge}
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {item.count}
                  </Badge>
                  {pct > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {pct}%
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                  {formatCompactCurrency(item.totalValue)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
