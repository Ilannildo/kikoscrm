import {
  assertSellerAccess,
  AuthContext,
  isAdmin,
  resolveSellerId,
} from '@common/utils/authorization.util';
import { toDecimal } from '@common/utils/decimal.util';
import { throwBadRequest, throwNotFound } from '@common/utils/http-error.util';
import { buildPaginatedResult, getSkip, parseSortParam } from '@common/utils/pagination.util';
import {
  canTransitionDealStatus,
  getTransitionErrorMessage,
} from '@/domain/deals/deal-status.transition';
import { PrismaService } from '@infra/database/prisma.service';
import {
  ActivityType,
  Codes,
  CreateDealDto,
  DealStatus,
  ListDealsQueryDto,
  UpdateDealDto,
  UpdateDealStatusDto,
  UserRole,
} from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { ActivitiesService } from '../activities/activities.service';
import { mapDealToDto, mapDealsToDto } from './deals.mapper';

const DEAL_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'value'] as const;

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async list(query: ListDealsQueryDto, auth: AuthContext) {
    const { page, pageSize, search, status, sellerId, leadId, minValue, maxValue, from, to, sort } =
      query;
    const where: Prisma.DealWhereInput = {};

    if (!isAdmin(auth.role)) {
      where.sellerId = auth.userId;
    } else if (sellerId) {
      where.sellerId = sellerId;
    }

    if (status) where.status = status;
    if (leadId) where.leadId = leadId;

    if (minValue !== undefined || maxValue !== undefined) {
      where.value = {};
      if (minValue !== undefined) where.value.gte = minValue;
      if (maxValue !== undefined) where.value.lte = maxValue;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = parseSortParam(sort, DEAL_SORT_FIELDS, 'createdAt');

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        orderBy,
        skip: getSkip(page, pageSize),
        take: pageSize,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return buildPaginatedResult(mapDealsToDto(deals), total, page, pageSize);
  }

  async getById(id: string, auth: AuthContext) {
    const deal = await this.findDealOrThrow(id);
    assertSellerAccess(auth, deal.sellerId);
    return mapDealToDto(deal);
  }

  async create(data: CreateDealDto, auth: AuthContext) {
    const sellerId = resolveSellerId(auth, data.sellerId);
    await this.assertLeadExists(data.leadId);

    if (isAdmin(auth.role) && data.sellerId) {
      await this.assertSellerExists(data.sellerId);
    } else if (!isAdmin(auth.role)) {
      assertSellerAccess(auth, data.sellerId);
    }

    const deal = await this.prisma.$transaction(async (tx) => {
      const created = await tx.deal.create({
        data: {
          name: data.name,
          value: toDecimal(data.value),
          description: data.description ?? null,
          leadId: data.leadId,
          sellerId,
          status: data.status,
        },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.DEAL_CREATED,
          dealId: created.id,
          leadId: created.leadId,
          userId: auth.userId,
          metadata: { dealName: created.name, value: data.value },
        },
        tx,
      );

      return created;
    });

    return mapDealToDto(deal);
  }

  async update(id: string, data: UpdateDealDto, auth: AuthContext) {
    const deal = await this.findDealOrThrow(id);
    assertSellerAccess(auth, deal.sellerId);

    if (data.leadId) {
      await this.assertLeadExists(data.leadId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.deal.update({
        where: { id },
        data: {
          name: data.name,
          value: data.value !== undefined ? toDecimal(data.value) : undefined,
          description: data.description,
          leadId: data.leadId,
        },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.DEAL_UPDATED,
          dealId: result.id,
          leadId: result.leadId,
          userId: auth.userId,
          metadata: { dealName: result.name },
        },
        tx,
      );

      return result;
    });

    return mapDealToDto(updated);
  }

  async changeStatus(id: string, data: UpdateDealStatusDto, auth: AuthContext) {
    const deal = await this.findDealOrThrow(id);
    assertSellerAccess(auth, deal.sellerId);

    const currentStatus = deal.status as DealStatus;
    const nextStatus = data.status;

    if (!canTransitionDealStatus(currentStatus, nextStatus)) {
      throwBadRequest(
        Codes.CRM__INVALID_DEAL_STATUS_TRANSITION,
        getTransitionErrorMessage(currentStatus, nextStatus),
      );
    }

    if (currentStatus === nextStatus) {
      return mapDealToDto(deal);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.deal.update({
        where: { id },
        data: { status: nextStatus },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.DEAL_STATUS_CHANGED,
          dealId: result.id,
          leadId: result.leadId,
          userId: auth.userId,
          metadata: {
            from: currentStatus,
            to: nextStatus,
            dealName: result.name,
          },
        },
        tx,
      );

      if (nextStatus === DealStatus.won) {
        await this.activitiesService.create(
          {
            type: ActivityType.DEAL_WON,
            dealId: result.id,
            leadId: result.leadId,
            userId: auth.userId,
            metadata: { dealName: result.name, value: result.value.toString() },
          },
          tx,
        );
      }

      if (nextStatus === DealStatus.lost) {
        await this.activitiesService.create(
          {
            type: ActivityType.DEAL_LOST,
            dealId: result.id,
            leadId: result.leadId,
            userId: auth.userId,
            metadata: { dealName: result.name },
          },
          tx,
        );
      }

      return result;
    });

    return mapDealToDto(updated);
  }

  async delete(id: string, auth: AuthContext) {
    const deal = await this.findDealOrThrow(id);
    assertSellerAccess(auth, deal.sellerId);
    await this.prisma.deal.delete({ where: { id } });
    return { id };
  }

  private async findDealOrThrow(id: string) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) throwNotFound(Codes.CRM__DEAL_NOT_FOUND);
    return deal;
  }

  private async assertLeadExists(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throwNotFound(Codes.CRM__LEAD_NOT_FOUND);
  }

  private async assertSellerExists(sellerId: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.seller },
    });
    if (!seller) throwNotFound(Codes.CRM__SELLER_NOT_FOUND);
  }
}
