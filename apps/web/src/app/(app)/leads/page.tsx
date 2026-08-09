"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@kikos/ui/components/button";
import { Skeleton } from "@kikos/ui/components/skeleton";
import { EmptyState } from "@kikos/ui/components/empty-state";
import { ErrorState } from "@kikos/ui/components/error-state";
import { Badge } from "@kikos/ui/components/badge";
import { Avatar } from "@kikos/ui/components/avatar";
import { Input } from "@kikos/ui/components/input";
import { Select } from "@kikos/ui/components/select";
import { LEAD_STATUS_META, LEAD_STATUS_ORDER } from "@/lib/status";
import { api } from "@/trpc/react";
import { LeadDetail } from "@/components/leads/lead-detail";
import { LeadDto, LeadStatus } from "@kikos/shared";
import { formatDate } from "@kikos/shared/src/utils/format";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [sellerId, setSellerId] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedLead, setSelectedLead] = React.useState<LeadDto | null>(null);

  const { data: me, isLoading: isLoadingMe } = api.users.me.useQuery();
  const isAdmin = me?.role === "admin";

  const { data, isLoading, isError, error, refetch } = api.leads.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    status: (status as LeadStatus) || undefined,
    sellerId: sellerId || undefined,
  });

  const { data: sellersData } = api.sellers.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const sellers = sellersData?.data ?? [];

const handleSearch = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
    },
    []
  );

  const handleRowClick = (lead: LeadDto) => {
    setSelectedLead(lead);
  };

  return (
    <div>
      <PageHeader
        title="Lista de Leads"
        description="Todos os contatos e oportunidades comerciais"
        actions={
          <Button
            className="bg-accent text-accent-foreground"
            onClick={() => router.push("/leads/novo")}
          >
            <Plus className="size-4" />
            Novo Lead
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 md:max-w-sm">
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
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 w-40"
          >
            <option value="">Status</option>
            {LEAD_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_META[s].label}
              </option>
            ))}
          </Select>

          {isAdmin && (
            <Select
              value={sellerId}
              onChange={(e) => {
                setSellerId(e.target.value);
                setPage(1);
              }}
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Erro ao carregar leads"
              message={error?.message}
              onRetry={() => refetch()}
            />
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Users className="size-6" />}
              title="Nenhum lead encontrado"
              description="Comece criando seu primeiro lead."
              action={
                <Button
                  className="bg-accent text-accent-foreground"
                  onClick={() => router.push("/leads/novo")}
                >
                  <UserPlus className="size-4" />
                  Novo Lead
                </Button>
              }
            />
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  {isAdmin && (
                    <th className="px-4 py-3 font-medium">Vendedor</th>
                  )}
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Última Interação</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((lead) => {
                  const vendedor = sellers.find((s) => s.id === lead.sellerId);
                  const statusMeta = LEAD_STATUS_META[lead.status];
                  return (
<tr
                      key={lead.id}
                      onClick={() => handleRowClick(lead)}
                      className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-accent/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={lead.name} size="sm" />
                          <span className="font-medium text-foreground">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.company ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.phone ?? "—"}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={vendedor?.name} size="sm" />
                            <span className="text-muted-foreground">
                              {vendedor?.name ?? "—"}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Badge variant={statusMeta.badge}>
                          <span
                            className={cn("size-1.5 rounded-full", statusMeta.dot)}
                          />
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(lead.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Página {data.pagination.page} de {data.pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
)}
      </div>

      {/* Detail drawer */}
      <LeadDetail
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        sellers={sellers}
      />
    </div>
  );
}
