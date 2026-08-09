"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableDealCard({
  deal,
  lead,
  seller,
  onClick,
}: {
  deal: DealDto;
  lead?: LeadDto;
  seller?: SellerDto;
  onClick: (deal: DealDto) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <DealCard deal={deal} lead={lead} seller={seller} onClick={onClick} />
    </div>
  );
}

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

  const [activeDeal, setActiveDeal] = React.useState<DealDto | null>(null);
  const [overColumn, setOverColumn] = React.useState<DealStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

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
      setActiveDeal(null);
      setOverColumn(null);
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const deal = localDeals.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    // Determine the column under the cursor
    const id = over.id;
    if (COLUMN_ORDER.includes(id as DealStatus)) {
      setOverColumn(id as DealStatus);
    } else {
      const deal = localDeals.find((d) => d.id === id);
      if (deal) setOverColumn(deal.status);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setOverColumn(null);

    if (!over) {
      setActiveDeal(null);
      return;
    }

    // Resolve target status
    let targetStatus: DealStatus | null = null;
    if (COLUMN_ORDER.includes(over.id as DealStatus)) {
      targetStatus = over.id as DealStatus;
    } else {
      const targetDeal = localDeals.find((d) => d.id === over.id);
      targetStatus = targetDeal?.status ?? null;
    }

    const deal = localDeals.find((d) => d.id === active.id);
    if (!deal || !targetStatus) {
      setActiveDeal(null);
      return;
    }

    if (deal.status === targetStatus) {
      setActiveDeal(null);
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[deal.status];
    if (!allowed.includes(targetStatus)) {
      setActiveDeal(null);
      toast({
        title: "Transição inválida",
        description: "O status atual do negócio não permite essa mudança.",
        variant: "error",
      });
      return;
    }

    // Optimistic local update
    setLocalDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, status: targetStatus! } : d))
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDeal(null);
        setOverColumn(null);
      }}
    >
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {groups.map(({ status, deals: columnDeals }) => {
          const meta = DEAL_STATUS_META[status];
          const isOver = overColumn === status;
          const canDropHere = activeDeal
            ? ALLOWED_TRANSITIONS[activeDeal.status].includes(status)
            : false;

          return (
            <DndColumn
              key={status}
              status={status}
              label={meta.label}
              dot={meta.dot}
              count={columnDeals.length}
              isOver={isOver}
              canDropHere={canDropHere}
            >
              <SortableContext
                items={columnDeals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnDeals.map((deal) => {
                  const lead = leads.find((l) => l.id === deal.leadId);
                  const seller = sellers.find((s) => s.id === deal.sellerId);
                  return (
                    <SortableDealCard
                      key={deal.id}
                      deal={deal}
                      lead={lead}
                      seller={seller}
                      onClick={onSelectDeal}
                    />
                  );
                })}
              </SortableContext>

              {columnDeals.length === 0 && (
                <div className="flex min-h-[80px] flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 text-[11px] text-muted-foreground">
                  Arraste para cá
                </div>
              )}
            </DndColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-2 opacity-90 shadow-lg ring-2 ring-accent/40">
            <DealCard
              deal={activeDeal}
              lead={leads.find((l) => l.id === activeDeal.leadId)}
              seller={sellers.find((s) => s.id === activeDeal.sellerId)}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DndColumn({
  status,
  label,
  dot,
  count,
  isOver,
  canDropHere,
  children,
}: {
  status: DealStatus;
  label: string;
  dot: string;
  count: number;
  isOver: boolean;
  canDropHere: boolean;
  children: React.ReactNode;
}) {
const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col rounded-xl border border-border/60 bg-card/40",
        isOver && canDropHere && "border-accent/60 bg-accent/10",
        isOver && !canDropHere && "border-destructive/40 bg-destructive/5"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dot)} />
          <span className="text-[13px] font-semibold text-foreground">
            {label}
          </span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {count}
          </span>
        </div>
        <button
          type="button"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Adicionar negócio em ${label}`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
    </div>
  );
}
