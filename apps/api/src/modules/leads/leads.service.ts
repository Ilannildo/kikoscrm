import {
  assertSellerAccess,
  AuthContext,
  isAdmin,
  resolveSellerId,
} from '@common/utils/authorization.util';
import { buildPaginatedResult, getSkip, parseSortParam } from '@common/utils/pagination.util';
import { throwNotFound } from '@common/utils/http-error.util';
import { PrismaService } from '@infra/database/prisma.service';
import {
  ActivityType,
  Codes,
  CreateLeadDto,
  ListLeadsQueryDto,
  UpdateLeadDto,
  UserRole,
} from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { ActivitiesService } from '../activities/activities.service';
import { mapLeadToDto, mapLeadsToDto } from './leads.mapper';

const LEAD_SORT_FIELDS = ['createdAt', 'updatedAt', 'name'] as const;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async list(query: ListLeadsQueryDto, auth: AuthContext) {
    const { page, pageSize, search, status, sellerId, source, sort } = query;
    const where: Prisma.LeadWhereInput = {};

    if (!isAdmin(auth.role)) {
      where.sellerId = auth.userId;
    } else if (sellerId) {
      where.sellerId = sellerId;
    }

    if (status) where.status = status;
    if (source) where.source = { contains: source, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = parseSortParam(sort, LEAD_SORT_FIELDS, 'createdAt');

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: getSkip(page, pageSize),
        take: pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return buildPaginatedResult(mapLeadsToDto(leads), total, page, pageSize);
  }

  async getById(id: string, auth: AuthContext) {
    const lead = await this.findLeadOrThrow(id);
    assertSellerAccess(auth, lead.sellerId);
    return mapLeadToDto(lead);
  }

  async create(data: CreateLeadDto, auth: AuthContext) {
    const sellerId = resolveSellerId(auth, data.sellerId);

    if (isAdmin(auth.role) && data.sellerId) {
      await this.assertSellerExists(data.sellerId);
    } else if (!isAdmin(auth.role) && data.sellerId !== auth.userId) {
      assertSellerAccess(auth, data.sellerId);
    }

    const lead = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: {
          name: data.name,
          email: data.email ?? null,
          phone: data.phone ?? null,
          company: data.company ?? null,
          source: data.source ?? null,
          notes: data.notes ?? null,
          status: data.status,
          sellerId,
        },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.LEAD_CREATED,
          leadId: created.id,
          userId: auth.userId,
          metadata: { leadName: created.name },
        },
        tx,
      );

      return created;
    });

    return mapLeadToDto(lead);
  }

  async update(id: string, data: UpdateLeadDto, auth: AuthContext) {
    const lead = await this.findLeadOrThrow(id);
    assertSellerAccess(auth, lead.sellerId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.lead.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          source: data.source,
          notes: data.notes,
          status: data.status,
        },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.LEAD_UPDATED,
          leadId: result.id,
          userId: auth.userId,
          metadata: { leadName: result.name },
        },
        tx,
      );

      return result;
    });

    return mapLeadToDto(updated);
  }

  async delete(id: string, auth: AuthContext) {
    const lead = await this.findLeadOrThrow(id);
    assertSellerAccess(auth, lead.sellerId);
    await this.prisma.lead.delete({ where: { id } });
    return { id };
  }

  private async findLeadOrThrow(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throwNotFound(Codes.CRM__LEAD_NOT_FOUND);
    return lead;
  }

  private async assertSellerExists(sellerId: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.seller },
    });
    if (!seller) throwNotFound(Codes.CRM__SELLER_NOT_FOUND);
  }
}
