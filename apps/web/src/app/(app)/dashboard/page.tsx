"use client";

import * as React from "react";
import {
  Users,
  Banknote,
  TrendingUp,
  Percent,
  FolderOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@kikos/ui/components/select";
import { ErrorState } from "@kikos/ui/components/error-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { RecentDeals } from "@/components/dashboard/recent-deals";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { formatCompactCurrency } from "@kikos/shared/src/utils/format";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  const [sellerId, setSellerId] = React.useState("");

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === "admin";

  const { data: sellersData } = api.sellers.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: !!isAdmin }
  );
  const sellers = sellersData?.data ?? [];

  const { data, isLoading, isError, error, refetch } =
    api.dashboard.get.useQuery({
      sellerId: sellerId || undefined,
    });

const metrics = data?.metrics;
  const pipeline = data?.pipeline ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const recentDeals = data?.recentDeals ?? [];

  const wonValue =
    pipeline.find((p) => p.status === "won")?.totalValue ?? "0";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação comercial"
        actions={
          isAdmin ? (
            <Select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="h-9 w-44"
              aria-label="Filtrar por vendedor"
            >
              <option value="">Todos os vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState
          title="Erro ao carregar o dashboard"
          message={error?.message}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total de leads"
              value={String(metrics?.totalLeads ?? 0)}
              icon={Users}
              hint="Leads cadastrados"
            />
            <KpiCard
              title="Valor do pipeline"
              value={formatCompactCurrency(metrics?.pipelineValue ?? "0")}
              icon={Banknote}
              hint="Negócios em aberto"
              accent="kikos"
            />
<KpiCard
              title="Valor ganho"
              value={formatCompactCurrency(wonValue)}
              icon={TrendingUp}
              hint={`${metrics?.wonDeals ?? 0} negócios ganhos`}
              accent="success"
            />
            <KpiCard
              title="Taxa de conversão"
              value={`${metrics?.conversionRate ?? 0}%`}
              icon={Percent}
              hint={`${metrics?.lostDeals ?? 0} perdidos`}
            />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              title="Negócios em aberto"
              value={String(metrics?.openDeals ?? 0)}
              icon={FolderOpen}
              hint="Novos + em andamento"
            />
            <KpiCard
              title="Negócios ganhos"
              value={String(metrics?.wonDeals ?? 0)}
              icon={CheckCircle2}
              accent="success"
            />
            <KpiCard
              title="Negócios perdidos"
              value={String(metrics?.lostDeals ?? 0)}
              icon={XCircle}
              accent="danger"
            />
          </div>

          {/* Pipeline + Activities */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PipelineSummary items={pipeline} />
            <RecentActivities activities={recentActivities} />
          </div>

          {/* Recent deals */}
          <RecentDeals deals={recentDeals} />
        </div>
      )}
    </div>
  );
}
