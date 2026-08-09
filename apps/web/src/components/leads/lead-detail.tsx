"use client";

import * as React from "react";
import type { LeadDto, SellerDto } from "@kikos/shared";
import { Drawer } from "@kikos/ui/components/drawer";
import { Badge } from "@kikos/ui/components/badge";
import { Avatar } from "@kikos/ui/components/avatar";
import { LEAD_STATUS_META } from "@/lib/status";
import { formatDate } from "@kikos/shared/src/utils/format";
import { cn } from "@/lib/utils";

interface LeadDetailProps {
  lead: LeadDto | null;
  onClose: () => void;
  sellers: SellerDto[];
}

export function LeadDetail({ lead, onClose, sellers }: LeadDetailProps) {
  const seller = lead ? sellers.find((s) => s.id === lead?.sellerId) : undefined;

  const statusMeta = lead ? LEAD_STATUS_META[lead.status] : undefined;

  return (
    <Drawer
      open={!!lead}
      onClose={onClose}
      title="Detalhes do Lead"
      description={statusMeta?.label}
    >
      {!lead ? null : (
        <div className="space-y-5">
          {/* Summary */}
          <div>
            <div className="flex items-center gap-3">
              <Avatar name={lead.name} size="lg" />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {lead.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {lead.company ?? "Sem empresa"}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant={statusMeta?.badge}>
                <span
                  className={cn("size-1.5 rounded-full", statusMeta?.dot)}
                />
                {statusMeta?.label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <dl className="space-y-3 rounded-lg border border-border/60 p-4 text-[13px]">
            {lead.email && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">E-mail</dt>
                <dd className="font-medium text-foreground">{lead.email}</dd>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Telefone</dt>
                <dd className="font-medium text-foreground">{lead.phone}</dd>
              </div>
            )}
            {lead.source && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Origem</dt>
                <dd className="font-medium text-foreground">{lead.source}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Vendedor</dt>
              <dd className="flex items-center gap-2 font-medium text-foreground">
                <Avatar name={seller?.name} size="sm" />
                {seller?.name ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Criado em</dt>
              <dd className="font-medium text-foreground">
                {formatDate(lead.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Última atualização</dt>
              <dd className="font-medium text-foreground">
                {formatDate(lead.updatedAt)}
              </dd>
            </div>
            {lead.notes && (
              <div className="border-t border-border/60 pt-3">
                <dt className="mb-1 text-muted-foreground">Observações</dt>
                <dd className="whitespace-pre-wrap text-foreground">
                  {lead.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </Drawer>
  );
}
