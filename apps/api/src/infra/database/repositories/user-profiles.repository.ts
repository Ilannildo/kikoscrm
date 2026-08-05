import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserProfile } from '@kikos/db';

@Injectable()
export class UserProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserProfileCreateInput): Promise<UserProfile> {
    return await this.prisma.client.userProfile.create({
      data,
    });
  }

  update(
    id: string,
    data: Prisma.UserProfileUpdateInput,
  ): Promise<UserProfile> {
    return this.prisma.client.userProfile.update({
      where: {
        id,
      },
      data,
    });
  }

  get(params: {
    where: Prisma.UserProfileWhereInput;
    include?: Prisma.UserProfileInclude;
  }): Promise<UserProfile | null> {
    const { where, include } = params;

    return this.prisma.client.userProfile.findFirst({
      where,
      include,
    });
  }

  delete(id: string): Promise<UserProfile> {
    return this.prisma.client.userProfile.delete({
      where: {
        id,
      },
    });
  }

  list(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserProfileWhereUniqueInput;
    where?: Prisma.UserProfileWhereInput;
    orderBy?: Prisma.UserProfileOrderByWithRelationInput;
    include?: Prisma.UserProfileInclude;
  }): Promise<UserProfile[]> {
    const { cursor, orderBy, skip, take, where, include } = params;
    return this.prisma.client.userProfile.findMany({
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
    where?: Prisma.UserProfileWhereInput;
    include?: Prisma.UserProfileInclude;
    orderBy?: Prisma.UserProfileOrderByWithRelationInput;
  }): Promise<[number, UserProfile[]]> {
    const { page, limit, orderBy, where, include } = params;

    const skip = Math.abs(page - 1) * limit;

    return this.prisma.client.$transaction([
      this.prisma.client.userProfile.count({
        where,
        orderBy,
      }),
      this.prisma.client.userProfile.findMany({
        include,
        where,
        orderBy,
        skip,
        take: Number(limit),
      }),
    ]);
  }
}
