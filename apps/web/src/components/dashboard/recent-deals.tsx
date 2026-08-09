import * as React from "react";
import {
  formatCompactCurrency,
  timeAgo,
} from "@kikos/shared/src/utils/format";
import type { DealStatus } from "@kikos/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@kikos/ui/components/card";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { DEAL_STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

interface RecentDeal {
  id: string;
  name: string;
  value: string;
  status: DealStatus;
  sellerName: string;
  createdAt: string;
}

interface RecentDealsProps {
  deals: RecentDeal[];
  className?: string;
}

/**
 * Table/list of the most recent deals from the dashboard endpoint.
 * Uses the existing status badges and BRL currency formatting.
 */
export function RecentDeals({ deals, className }: RecentDealsProps) {
  if (deals.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <h3 className="text-sm font-semibold text-foreground">
          Negócios recentes
        </h3>
        <EmptyState
          icon={<span className="text-lg">•</span>}
          title="Nenhum negócio recente"
          description="Os negócios mais recentes aparecerão aqui."
          className="mt-4 min-h-[180px]"
        />
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">
        Negócios recentes
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Negócio</th>
              <th className="pb-2 pr-3 font-medium">Vendedor</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              <th className="pb-2 pr-3 text-right font-medium">Valor</th>
              <th className="pb-2 font-medium">Atualização</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const meta = DEAL_STATUS_META[deal.status];
              return (
                <tr
                  key={deal.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="py-2.5 pr-3 font-medium text-foreground">
                    {deal.name}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {deal.sellerName}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge variant={meta?.badge}>
                      {meta?.label ?? deal.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-foreground">
                    {formatCompactCurrency(deal.value)}
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {timeAgo(deal.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
