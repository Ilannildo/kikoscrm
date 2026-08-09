"use client";

import * as React from "react";
import type { DealDto, LeadDto, SellerDto } from "@kikos/shared";
import { Drawer } from "@kikos/ui/components/drawer";
import { Badge } from "@kikos/ui/components/badge";
import { Avatar } from "@kikos/ui/components/avatar";
import { Button } from "@kikos/ui/components/button";
import { Input } from "@kikos/ui/components/input";
import { Skeleton } from "@kikos/ui/components/skeleton";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { ErrorState } from "@kikos/ui/components/error-state";
import { useToast } from "@kikos/ui/components/toast";
import {
  formatCurrency,
  formatDate,
  timeAgo,
} from "@kikos/shared/src/utils/format";
import { DEAL_STATUS_META } from "@/lib/status";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface DealDetailProps {
  deal: DealDto | null;
  onClose: () => void;
  leads: LeadDto[];
  sellers: SellerDto[];
}

export function DealDetail({ deal, onClose, leads, sellers }: DealDetailProps) {
  const { toast } = useToast();
  const [comment, setComment] = React.useState("");

  const lead = deal ? leads.find((l) => l.id === deal.leadId) : undefined;
  const seller = deal ? sellers.find((s) => s.id === deal.sellerId) : undefined;

const { data: commentsData, isLoading, isError, refetch } =
    api.comments.listByDeal.useQuery(
      { dealId: deal?.id ?? "" },
      { enabled: !!deal?.id }
    );

  const createComment = api.comments.createForDeal.useMutation({
    onSuccess: () => {
      setComment("");
      refetch();
      toast({
        title: "Comentário adicionado",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "error",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal || !comment.trim()) return;
    createComment.mutate({ dealId: deal.id, content: comment });
  };

  const comments = commentsData?.data ?? [];

  return (
    <Drawer
      open={!!deal}
      onClose={onClose}
      title="Detalhes do Negócio"
      description={
        deal ? DEAL_STATUS_META[deal.status].label : undefined
      }
    >
      {!deal ? null : (
        <div className="space-y-5">
          {/* Summary */}
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {deal.name}
            </h3>
            <div className="mt-1 flex items-center justify-between">
<span className="text-xl font-bold text-kikos">
                {formatCurrency(deal.value)}
              </span>
              <Badge variant={DEAL_STATUS_META[deal.status].badge}>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    DEAL_STATUS_META[deal.status].dot
                  )}
                />
                {DEAL_STATUS_META[deal.status].label}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <dl className="space-y-3 rounded-lg border border-border/60 p-4 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Lead</dt>
              <dd className="flex items-center gap-2 font-medium text-foreground">
                <Avatar name={lead?.name} size="sm" />
                {lead?.name ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Vendedor</dt>
              <dd className="flex items-center gap-2 font-medium text-foreground">
                <Avatar name={seller?.name} size="sm" />
                {seller?.name ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Data de criação</dt>
              <dd className="font-medium text-foreground">
                {formatDate(deal.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Última interação</dt>
              <dd className="font-medium text-foreground">
                {timeAgo(deal.updatedAt)}
              </dd>
            </div>
            {deal.description && (
              <div className="border-t border-border/60 pt-3">
                <dt className="mb-1 text-muted-foreground">Descrição</dt>
                <dd className="text-foreground">{deal.description}</dd>
              </div>
            )}
          </dl>

          {/* Comments */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Histórico &amp; Comentários
            </h4>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : isError ? (
              <ErrorState
                title="Erro ao carregar comentários"
                onRetry={() => refetch()}
              />
            ) : comments.length === 0 ? (
              <EmptyState
                title="Nenhum comentário"
                description="Seja o primeiro a comentar sobre este negócio."
                className="py-6"
              />
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={c.authorName} size="sm" />
                      <span className="text-xs font-medium text-foreground">
                        {c.authorName ?? "Usuário"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
<p className="mt-2 text-[13px] text-foreground/90">
                      {c.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="h-9 flex-1 rounded-md"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-accent text-accent-foreground"
                disabled={!comment.trim() || createComment.isPending}
              >
                Enviar
              </Button>
            </form>
          </div>
        </div>
      )}
    </Drawer>
  );
}
