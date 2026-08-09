import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@kikos/ui/components/card";
import { Badge } from "@kikos/ui/components/badge";
import { Avatar } from "@kikos/ui/components/avatar";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { formatCompactCurrency, formatDateTime } from "@kikos/shared/src/utils/format";
import { DEAL_STATUS_META } from "@/lib/status";

interface RecentDealsProps {
  deals: Array<{
    id: string;
    name: string;
    value: string;
    status: keyof typeof DEAL_STATUS_META;
    sellerName: string;
    createdAt: string;
  }>;
}

export function RecentDeals({ deals }: RecentDealsProps) {
  const router = useRouter();

  if (deals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negócios recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhum negócio recente"
            description="Os negócios mais recentes aparecerão aqui."
            className="py-10"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Negócios recentes</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-2 sm:px-5 sm:py-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Negócio</th>
                <th className="px-3 py-2 font-medium">Vendedor</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
                <th className="px-3 py-2 text-right font-medium">Atualização</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const meta = DEAL_STATUS_META[deal.status];
                return (
                  <tr
                    key={deal.id}
                    onClick={() => router.push(`/deals?deal=${deal.id}`)}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-3 py-2.5 text-[13px] font-medium text-foreground">
                      {deal.name}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={deal.sellerName}
                          size="sm"
                          className="size-5 text-[8px]"
                        />
                        <span className="text-[12px] text-muted-foreground">
                          {deal.sellerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={meta.badge}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[13px] font-semibold text-accent">
                      {formatCompactCurrency(deal.value)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[12px] text-muted-foreground">
                      {formatDateTime(deal.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
