import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Log } from '@kikos/db';

@Injectable()
export class LogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LogCreateInput): Promise<Log> {
    return await this.prisma.client.log.create({
      data,
    });
  }

  update(id: string, data: Prisma.LogUpdateInput): Promise<Log> {
    return this.prisma.client.log.update({
      where: {
        id,
      },
      data,
    });
  }

  get(params: {
    where: Prisma.LogWhereInput;
    include?: Prisma.LogInclude;
  }): Promise<Log> {
    const { where, include } = params;

    return this.prisma.client.log.findFirst({
      where,
      include,
    });
  }

  delete(id: string): Promise<Log> {
    return this.prisma.client.log.delete({
      where: {
        id,
      },
    });
  }

  list(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LogWhereUniqueInput;
    where?: Prisma.LogWhereInput;
    orderBy?: Prisma.LogOrderByWithRelationInput;
    include?: Prisma.LogInclude;
  }): Promise<Log[]> {
    const { cursor, orderBy, skip, take, where, include } = params;
    return this.prisma.client.log.findMany({
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
    where?: Prisma.LogWhereInput;
    include?: Prisma.LogInclude;
    orderBy?: Prisma.LogOrderByWithRelationInput;
  }): Promise<[number, Log[]]> {
    const { page, limit, orderBy, where, include } = params;

    const skip = Math.abs(page - 1) * limit;

    return this.prisma.client.$transaction([
      this.prisma.client.log.count({
        where,
        orderBy,
      }),
      this.prisma.client.log.findMany({
        include,
        where,
        orderBy,
        skip,
        take: Number(limit),
      }),
    ]);
  }
}
