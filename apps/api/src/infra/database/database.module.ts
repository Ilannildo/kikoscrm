import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const repositories = [PrismaService];

@Global()
@Module({
  providers: repositories,
  exports: repositories,
})
export class DatabaseModule { }
