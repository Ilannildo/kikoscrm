"use client";

import * as React from "react";
import { Target, Users, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@kikos/ui/components/select";
import { ErrorState } from "@kikos/ui/components/error-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { RecentDeals } from "@/components/dashboard/recent-deals";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { api } from "@/trpc/react";
import { DealStatus, UserRole } from "@kikos/shared";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@kikos/shared/src/utils/format";

export default function DashboardPage() {
  const [sellerId, setSellerId] = React.useState("");

  const { data: me } = api.users.me.useQuery();
  const isAdmin = me?.role === UserRole.admin;

  const { data: sellersData } = api.sellers.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: isAdmin }
  );
  const sellers = sellersData?.data ?? [];

  const { data, isLoading, isError, error, refetch } =
    api.dashboard.get.useQuery({ sellerId: sellerId || undefined });

  const metrics = data?.metrics;
  const pipeline = data?.pipeline ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const recentDeals = data?.recentDeals ?? [];

  const wonValue =
    pipeline.find((p) => p.status === DealStatus.won)?.totalValue ?? "0";

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
              title="Total de Leads"
              value={String(metrics?.totalLeads ?? 0)}
              icon={<Users className="size-4" />}
              footer={
                <p className="text-[11px] text-muted-foreground">
                  {metrics?.openDeals ?? 0} negócios em aberto
                </p>
              }
            />
            <KpiCard
              title="Valor do Pipeline"
              value={formatCompactCurrency(metrics?.pipelineValue ?? "0")}
              icon={<Wallet className="size-4" />}
              footer={
                <p className="text-[11px] text-muted-foreground">
                  {formatCurrency(metrics?.pipelineValue ?? "0")}
                </p>
              }
            />
            <KpiCard
              title="Valor Ganho"
              value={formatCompactCurrency(wonValue)}
              icon={<TrendingUp className="size-4" />}
              footer={
                <p className="text-[11px] text-muted-foreground">
                  {metrics?.wonDeals ?? 0} negócios ganhos
                </p>
              }
            />
            <KpiCard
              title="Taxa de Conversão"
              value={`${Math.round((metrics?.conversionRate ?? 0) * 100)}%`}
              icon={<Target className="size-4" />}
              footer={
                <p className="text-[11px] text-muted-foreground">
                  {metrics?.lostDeals ?? 0} negócios perdidos
                </p>
              }
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
