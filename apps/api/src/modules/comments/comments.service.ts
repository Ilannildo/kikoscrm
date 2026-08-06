import { assertSellerAccess, AuthContext, isAdmin } from '@common/utils/authorization.util';
import { buildPaginatedResult, getSkip } from '@common/utils/pagination.util';
import { throwForbidden, throwNotFound } from '@common/utils/http-error.util';
import { PrismaService } from '@infra/database/prisma.service';
import {
  ActivityType,
  Codes,
  CreateCommentDto,
  ListCommentsQueryDto,
  UserRole,
} from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';
import { mapCommentToDto, mapCommentsToDto } from './comments.mapper';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async listByLead(leadId: string, query: ListCommentsQueryDto, auth: AuthContext) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throwNotFound(Codes.CRM__LEAD_NOT_FOUND);
    assertSellerAccess(auth, lead.sellerId);

    const { page, pageSize } = query;
    const where = { leadId };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, pageSize),
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return buildPaginatedResult(mapCommentsToDto(comments), total, page, pageSize);
  }

  async createForLead(leadId: string, data: CreateCommentDto, auth: AuthContext) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throwNotFound(Codes.CRM__LEAD_NOT_FOUND);
    assertSellerAccess(auth, lead.sellerId);

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          content: data.content,
          authorId: auth.userId,
          leadId,
        },
        include: { author: { select: { name: true } } },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.COMMENT_CREATED,
          leadId,
          userId: auth.userId,
          metadata: { commentId: created.id },
        },
        tx,
      );

      return created;
    });

    return mapCommentToDto(comment);
  }

  async listByDeal(dealId: string, query: ListCommentsQueryDto, auth: AuthContext) {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throwNotFound(Codes.CRM__DEAL_NOT_FOUND);
    assertSellerAccess(auth, deal.sellerId);

    const { page, pageSize } = query;
    const where = { dealId };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: getSkip(page, pageSize),
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return buildPaginatedResult(mapCommentsToDto(comments), total, page, pageSize);
  }

  async createForDeal(dealId: string, data: CreateCommentDto, auth: AuthContext) {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throwNotFound(Codes.CRM__DEAL_NOT_FOUND);
    assertSellerAccess(auth, deal.sellerId);

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          content: data.content,
          authorId: auth.userId,
          dealId,
        },
        include: { author: { select: { name: true } } },
      });

      await this.activitiesService.create(
        {
          type: ActivityType.COMMENT_CREATED,
          dealId,
          leadId: deal.leadId,
          userId: auth.userId,
          metadata: { commentId: created.id },
        },
        tx,
      );

      return created;
    });

    return mapCommentToDto(comment);
  }

  async delete(id: string, auth: AuthContext) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { lead: true, deal: true },
    });
    if (!comment) throwNotFound(Codes.CRM__COMMENT_NOT_FOUND);

    const sellerId = comment.lead?.sellerId ?? comment.deal?.sellerId;
    if (sellerId) {
      assertSellerAccess(auth, sellerId);
    }

    const isAuthor = comment.authorId === auth.userId;
    const isAdminUser = auth.role === UserRole.admin;

    if (!isAuthor && !isAdminUser) {
      throwForbidden('Apenas o autor ou administrador pode excluir este comentário.');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { id };
  }
}
