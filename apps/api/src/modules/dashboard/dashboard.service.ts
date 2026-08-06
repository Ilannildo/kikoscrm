import { AuthContext, isAdmin } from '@common/utils/authorization.util';
import { serializeDecimal } from '@common/utils/decimal.util';
import { PrismaService } from '@infra/database/prisma.service';
import {
  ActivityType,
  DashboardQueryDto,
  DealStatus,
} from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(query: DashboardQueryDto, auth: AuthContext) {
    const sellerFilter = this.buildSellerFilter(auth, query.sellerId);

    const dealWhere: Prisma.DealWhereInput = sellerFilter ? { sellerId: sellerFilter } : {};
    const leadWhere: Prisma.LeadWhereInput = sellerFilter ? { sellerId: sellerFilter } : {};

    const [
      totalLeads,
      openDeals,
      wonDeals,
      lostDeals,
      pipelineAgg,
      pipelineByStatus,
      recentDeals,
      recentActivities,
    ] = await Promise.all([
      this.prisma.lead.count({ where: leadWhere }),
      this.prisma.deal.count({
        where: {
          ...dealWhere,
          status: { in: [DealStatus.new, DealStatus.in_progress] },
        },
      }),
      this.prisma.deal.count({ where: { ...dealWhere, status: DealStatus.won } }),
      this.prisma.deal.count({ where: { ...dealWhere, status: DealStatus.lost } }),
      this.prisma.deal.aggregate({
        where: {
          ...dealWhere,
          status: { in: [DealStatus.new, DealStatus.in_progress] },
        },
        _sum: { value: true },
      }),
      this.prisma.deal.groupBy({
        by: ['status'],
        where: dealWhere,
        _count: { _all: true },
        _sum: { value: true },
      }),
      this.prisma.deal.findMany({
        where: dealWhere,
        include: { seller: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.activity.findMany({
        where: sellerFilter
          ? {
              OR: [
                { userId: sellerFilter },
                { deal: { sellerId: sellerFilter } },
                { lead: { sellerId: sellerFilter } },
              ],
            }
          : undefined,
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const closedDeals = wonDeals + lostDeals;
    const conversionRate = closedDeals > 0 ? wonDeals / closedDeals : 0;

    const pipeline = Object.values(DealStatus).map((status) => {
      const item = pipelineByStatus.find((p) => p.status === status);
      return {
        status,
        count: item?._count._all ?? 0,
        totalValue: serializeDecimal(item?._sum.value ?? 0),
      };
    });

    return {
      metrics: {
        totalLeads,
        openDeals,
        wonDeals,
        lostDeals,
        pipelineValue: serializeDecimal(pipelineAgg._sum.value ?? 0),
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      pipeline,
      recentDeals: recentDeals.map((deal) => ({
        id: deal.id,
        name: deal.name,
        value: serializeDecimal(deal.value),
        status: deal.status,
        sellerName: deal.seller.name,
        createdAt: deal.createdAt,
      })),
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        type: activity.type as ActivityType,
        metadata: activity.metadata as Record<string, unknown> | null,
        leadId: activity.leadId,
        dealId: activity.dealId,
        userId: activity.userId,
        userName: activity.user?.name ?? null,
        createdAt: activity.createdAt,
      })),
    };
  }

  private buildSellerFilter(auth: AuthContext, requestedSellerId?: string): string | undefined {
    if (!isAdmin(auth.role)) {
      return auth.userId;
    }
    return requestedSellerId;
  }
}
