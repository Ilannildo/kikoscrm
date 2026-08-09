"use client";

import * as React from "react";
import type { SellerDto } from "@kikos/shared";
import { Avatar } from "@kikos/ui/components/avatar";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@kikos/shared/src/utils/format";
import { cn } from "@/lib/utils";

interface SellerCardProps {
  seller: SellerDto;
  onEdit?: (seller: SellerDto) => void;
  onDelete?: (seller: SellerDto) => void;
}

export function SellerCard({ seller, onEdit, onDelete }: SellerCardProps) {
  const { metrics } = seller;
  const totalDeals = metrics.totalDeals;
  const winRate =
    totalDeals > 0
      ? Math.round((metrics.wonDeals / totalDeals) * 100)
      : 0;

  return (
    <div className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-border hover:bg-card/80">
      {/* Header: avatar + name + email */}
      <div className="flex items-start gap-3">
        <Avatar name={seller.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {seller.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {seller.email}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(seller)}
                className="rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Editar ${seller.name}`}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(seller)}
                className="rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Excluir ${seller.name}`}
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Negócios
          </p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {metrics.totalDeals}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Ganhos
          </p>
          <p className="mt-0.5 text-base font-semibold text-status-won">
            {metrics.wonDeals}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Abertos
          </p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {metrics.openDeals}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Pipeline
          </p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {formatCompactCurrency(metrics.pipelineValue)}
          </p>
        </div>
      </div>

      {/* Won value */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Valor ganho
        </span>
        <span className="text-sm font-semibold text-status-won">
          {formatCurrency(metrics.wonValue)}
        </span>
      </div>

      {/* Win rate */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="uppercase tracking-wide text-muted-foreground">
            Taxa de ganho
          </span>
          <span className="font-semibold text-foreground">{winRate}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={winRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Taxa de ganho"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              winRate >= 50
                ? "bg-status-won"
                : winRate >= 25
                ? "bg-status-progress"
                : "bg-status-lost"
            )}
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
