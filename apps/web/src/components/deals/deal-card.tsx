"use client";

import * as React from "react";
import { formatCompactCurrency } from "@kikos/shared/src/utils/format";
import type { DealDto, LeadDto, SellerDto } from "@kikos/shared";
import { Avatar } from "@kikos/ui/components/avatar";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: DealDto;
  lead?: LeadDto;
  seller?: SellerDto;
  onClick: (deal: DealDto) => void;
  dragging?: boolean;
  ghost?: boolean;
}

export function DealCard({
  deal,
  lead,
  seller,
  onClick,
  dragging,
  ghost,
}: DealCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(deal)}
      className={cn(
        "group w-full cursor-grab rounded-lg border border-border/60 bg-card p-3 text-left shadow-sm transition-all hover:border-border hover:bg-card/80 active:cursor-grabbing",
        dragging && "rotate-2 opacity-60 shadow-lg ring-2 ring-accent/40",
        ghost && "opacity-40"
      )}
    >
      <p className="truncate text-[13px] font-medium text-foreground">
        {deal.name}
      </p>
      <p className="mt-1 text-sm font-semibold text-accent">
        {formatCompactCurrency(deal.value)}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Avatar name={lead?.name} size="sm" className="size-5 text-[8px]" />
          <span className="truncate text-[11px] text-muted-foreground">
            {lead?.name ?? "—"}
          </span>
        </div>
        {seller && (
          <div className="flex shrink-0 items-center gap-1">
            <Avatar
              name={seller.name}
              size="sm"
              className="size-5 text-[8px]"
            />
            <span className="text-[10px] text-muted-foreground">
              {seller.name.split(" ")[0] || ""}{" "}
              {seller.name.split(" ")[1]?.[0] ?? ""}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
