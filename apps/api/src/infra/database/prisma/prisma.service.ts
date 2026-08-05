import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma } from '@kikos/db';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    return await prisma.$connect();
  }

  async onModuleDestroy() {
    return await prisma.$disconnect();
  }

  get client() {
    return prisma;
  }
}
