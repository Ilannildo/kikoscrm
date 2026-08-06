import { PrismaService } from '@infra/database/prisma.service';
import { ActivityType } from '@kikos/shared';
import { Injectable } from '@nestjs/common';
import { ActivityType as PrismaActivityType, Prisma } from 'prisma/generated/client';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      type: ActivityType;
      metadata?: Record<string, unknown>;
      leadId?: string;
      dealId?: string;
      userId?: string;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.activity.create({
      data: {
        type: data.type as PrismaActivityType,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        leadId: data.leadId,
        dealId: data.dealId,
        userId: data.userId,
      },
    });
  }
}
