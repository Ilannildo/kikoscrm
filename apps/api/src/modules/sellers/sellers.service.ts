import { AuthContext, isAdmin } from '@common/utils/authorization.util';
import { serializeDecimal, sumDecimals } from '@common/utils/decimal.util';
import { buildPaginatedResult, getSkip } from '@common/utils/pagination.util';
import { throwNotFound } from '@common/utils/http-error.util';
import { PrismaService } from '@infra/database/prisma.service';
import { Codes, DealStatus, ListSellersQueryDto, UserRole } from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSellersQueryDto, auth: AuthContext) {
    const { page, pageSize, search } = query;

    const where: Prisma.UserWhereInput = { role: UserRole.seller };

    if (!isAdmin(auth.role)) {
      where.id = auth.userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sellers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: getSkip(page, pageSize),
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = await Promise.all(
      sellers.map(async (seller) => ({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        createdAt: seller.createdAt,
        metrics: await this.getMetrics(seller.id),
      })),
    );

    return buildPaginatedResult(data, total, page, pageSize);
  }

  async getById(id: string, auth: AuthContext) {
    const seller = await this.prisma.user.findFirst({
      where: { id, role: UserRole.seller },
    });

    if (!seller) throwNotFound(Codes.CRM__SELLER_NOT_FOUND);

    if (!isAdmin(auth.role) && seller.id !== auth.userId) {
      throwNotFound(Codes.CRM__SELLER_NOT_FOUND);
    }

    return {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      createdAt: seller.createdAt,
      metrics: await this.getMetrics(seller.id),
    };
  }

  private async getMetrics(sellerId: string) {
    const [totalDeals, wonDeals, lostDeals, openDeals, pipelineAgg, wonAgg] =
      await Promise.all([
        this.prisma.deal.count({ where: { sellerId } }),
        this.prisma.deal.count({ where: { sellerId, status: DealStatus.won } }),
        this.prisma.deal.count({ where: { sellerId, status: DealStatus.lost } }),
        this.prisma.deal.count({
          where: {
            sellerId,
            status: { in: [DealStatus.new, DealStatus.in_progress] },
          },
        }),
        this.prisma.deal.aggregate({
          where: {
            sellerId,
            status: { in: [DealStatus.new, DealStatus.in_progress] },
          },
          _sum: { value: true },
        }),
        this.prisma.deal.aggregate({
          where: { sellerId, status: DealStatus.won },
          _sum: { value: true },
        }),
      ]);

    return {
      totalDeals,
      wonDeals,
      lostDeals,
      openDeals,
      pipelineValue: serializeDecimal(pipelineAgg._sum.value ?? 0),
      wonValue: serializeDecimal(wonAgg._sum.value ?? 0),
    };
  }
}
