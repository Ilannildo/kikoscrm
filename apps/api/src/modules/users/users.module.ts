import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LogsService } from '@module/logs/logs.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, LogsService],
})
export class UsersModule {}
