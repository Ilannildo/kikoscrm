"use client";

import { DealDetail } from "@/components/deals/deal-detail";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { PageHeader } from "@/components/layout/page-header";
import { DEAL_STATUS_META, DEAL_STATUS_ORDER } from "@/lib/status";
import { api } from "@/trpc/react";
import type { DealDto, DealStatus } from "@kikos/shared";
import { Button } from "@kikos/ui/components/button";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { ErrorState } from "@kikos/ui/components/error-state";
import { Input } from "@kikos/ui/components/input";
import { Select } from "@kikos/ui/components/select";
import { Skeleton } from "@kikos/ui/components/skeleton";
import { Plus, Search, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function DealsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [sellerId, setSellerId] = React.useState("");
  const [selectedDeal, setSelectedDeal] = React.useState<DealDto | null>(null);

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === "admin";

  const queryInput = React.useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      search: search || undefined,
      status: (status as DealStatus) || undefined,
      sellerId: sellerId || undefined,
    }),
    [search, status, sellerId]
  );

  const { data, isLoading, isError, error, refetch } =
    api.deals.list.useQuery(queryInput);

  const { data: leadsData } = api.leads.list.useQuery({
    page: 1,
    pageSize: 100,
  });
  const leads = leadsData?.data ?? [];

  const { data: sellersData } = api.sellers.list.useQuery({
    page: 1,
    pageSize: 100,
  });
  const sellers = sellersData?.data ?? [];

  const deals = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Negócios"
        description="Gerencie seu pipeline comercial"
        actions={
          <Button
            className="bg-accent text-accent-foreground"
            onClick={() => router.push("/deals/novo")}
          >
            <Plus className="size-4" />
            Novo Negócio
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative flex-1 md:max-w-sm"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-9 rounded-md pl-9"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-44"
          >
            <option value="">Status</option>
            {DEAL_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {DEAL_STATUS_META[s].label}
              </option>
            ))}
          </Select>

          {isAdmin && (
            <Select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="h-9 w-44"
            >
              <option value="">Vendedor</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Erro ao carregar negócios"
          message={error?.message}
          onRetry={() => refetch()}
        />
      ) : deals.length === 0 ? (
        <EmptyState
          icon={<Target className="size-6" />}
          title="Nenhum negócio encontrado"
          description="Comece criando seu primeiro negócio."
          action={
            <Button
              className="bg-accent text-accent-foreground"
              onClick={() => router.push("/deals/novo")}
            >
              <Plus className="size-4" />
              Criar negócio
            </Button>
          }
        />
      ) : (
        <KanbanBoard
          deals={deals}
          leads={leads}
          sellers={sellers}
          onSelectDeal={setSelectedDeal}
        />
      )}

      {/* Detail drawer */}
      <DealDetail
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        leads={leads}
        sellers={sellers}
      />
    </div>
  );
}
