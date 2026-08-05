import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserSettings } from '@kikos/db';

@Injectable()
export class UserSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserSettingsCreateInput): Promise<UserSettings> {
    return await this.prisma.client.userSettings.create({
      data,
    });
  }

  update(
    id: string,
    data: Prisma.UserSettingsUpdateInput,
  ): Promise<UserSettings> {
    return this.prisma.client.userSettings.update({
      where: {
        id,
      },
      data,
    });
  }

  get(params: {
    where: Prisma.UserSettingsWhereInput;
    include?: Prisma.UserSettingsInclude;
  }): Promise<UserSettings | null> {
    const { where, include } = params;

    return this.prisma.client.userSettings.findFirst({
      where,
      include,
    });
  }

  delete(id: string): Promise<UserSettings> {
    return this.prisma.client.userSettings.delete({
      where: {
        id,
      },
    });
  }

  list(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserSettingsWhereUniqueInput;
    where?: Prisma.UserSettingsWhereInput;
    orderBy?: Prisma.UserSettingsOrderByWithRelationInput;
    include?: Prisma.UserSettingsInclude;
  }): Promise<UserSettings[]> {
    const { cursor, orderBy, skip, take, where, include } = params;
    return this.prisma.client.userSettings.findMany({
      where,
      orderBy,
      cursor,
      skip,
      take,
      include,
    });
  }

  paginate(params: {
    page: number;
    limit: number;
    where?: Prisma.UserSettingsWhereInput;
    include?: Prisma.UserSettingsInclude;
    orderBy?: Prisma.UserSettingsOrderByWithRelationInput;
  }): Promise<[number, UserSettings[]]> {
    const { page, limit, orderBy, where, include } = params;

    const skip = Math.abs(page - 1) * limit;

    return this.prisma.client.$transaction([
      this.prisma.client.userSettings.count({
        where,
        orderBy,
      }),
      this.prisma.client.userSettings.findMany({
        include,
        where,
        orderBy,
        skip,
        take: Number(limit),
      }),
    ]);
  }
}
