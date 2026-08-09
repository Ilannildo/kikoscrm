"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { DealDto, DealStatus, LeadDto, SellerDto } from "@kikos/shared";
import { DealStatus as DealStatusEnum } from "@kikos/shared";
import { DEAL_STATUS_META } from "@/lib/status";
import { api } from "@/trpc/react";
import { useToast } from "@kikos/ui/components/toast";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";

interface KanbanBoardProps {
  deals: DealDto[];
  leads: LeadDto[];
  sellers: SellerDto[];
  onSelectDeal: (deal: DealDto) => void;
}

const ALLOWED_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  [DealStatusEnum.new]: [DealStatusEnum.in_progress],
  [DealStatusEnum.in_progress]: [DealStatusEnum.won, DealStatusEnum.lost],
  [DealStatusEnum.won]: [],
  [DealStatusEnum.lost]: [],
};

const COLUMN_ORDER: DealStatus[] = [
  DealStatusEnum.new,
  DealStatusEnum.in_progress,
  DealStatusEnum.won,
  DealStatusEnum.lost,
];

export function KanbanBoard({
  deals,
  leads,
  sellers,
  onSelectDeal,
}: KanbanBoardProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Local optimistic state synced from server data
  const [localDeals, setLocalDeals] = React.useState(deals);

  React.useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const [dragState, setDragState] = React.useState<{
    deal: DealDto;
    from: DealStatus;
  } | null>(null);
  const [overColumn, setOverColumn] = React.useState<DealStatus | null>(null);

  const changeStatusMutation = api.deals.changeStatus.useMutation({
    onError: (error) => {
      // Revert to server state on error
      setLocalDeals(deals);
      toast({
        title: "Não foi possível mover o negócio",
        description: error.message,
        variant: "error",
      });
    },
    onSettled: () => {
      utils.deals.list.invalidate();
      setDragState(null);
      setOverColumn(null);
    },
  });

  const handleDrop = (deal: DealDto, targetStatus: DealStatus) => {
    if (deal.status === targetStatus) {
      setDragState(null);
      setOverColumn(null);
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[deal.status];
    if (!allowed.includes(targetStatus)) {
      setDragState(null);
      setOverColumn(null);
      toast({
        title: "Transição inválida",
        description: "O status atual do negócio não permite essa mudança.",
        variant: "error",
      });
      return;
    }

    // Optimistic local update
    setLocalDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, status: targetStatus } : d))
    );

    changeStatusMutation.mutate({
      dealId: deal.id,
      status: targetStatus,
    });
  };

  const groups = COLUMN_ORDER.map((status) => ({
    status,
    deals: localDeals.filter((d) => d.status === status),
  }));

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-2">
      {groups.map(({ status, deals: columnDeals }) => {
        const meta = DEAL_STATUS_META[status];
        const isOver = overColumn === status;
        const canDropHere = dragState
          ? ALLOWED_TRANSITIONS[dragState.deal.status].includes(status)
          : false;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(status);
            }}
            onDragLeave={() => setOverColumn(null)}
            onDrop={() => {
              if (dragState && canDropHere) {
                handleDrop(dragState.deal, status);
              }
            }}
            className={cn(
              "flex w-72 shrink-0 snap-start flex-col rounded-xl border border-border/60 bg-card/40",
              isOver && canDropHere && "border-accent/60 bg-accent/10",
              isOver && !canDropHere && "border-destructive/40 bg-destructive/5"
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", meta.dot)} />
                <span className="text-[13px] font-semibold text-foreground">
                  {meta.label}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {columnDeals.length}
                </span>
              </div>
              <button
                type="button"
                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Adicionar negócio em ${meta.label}`}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2 p-2">
              {columnDeals.map((deal) => {
                const lead = leads.find((l) => l.id === deal.leadId);
                const seller = sellers.find((s) => s.id === deal.sellerId);
                return (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", deal.id);
                      setDragState({ deal, from: deal.status });
                    }}
                    onDragEnd={() => {
                      setDragState(null);
                      setOverColumn(null);
                    }}
                  >
                    <DealCard
                      deal={deal}
                      lead={lead}
                      seller={seller}
                      onClick={onSelectDeal}
                      dragging={dragState?.deal.id === deal.id}
                      ghost={dragState?.deal.id === deal.id}
                    />
                  </div>
                );
              })}

              {columnDeals.length === 0 && (
                <div className="flex min-h-[80px] flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 text-[11px] text-muted-foreground">
                  Arraste para cá
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
