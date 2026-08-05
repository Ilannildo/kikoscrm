import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { HttpModule } from './http/http.module';

@Module({
  imports: [LoggerModule, DatabaseModule, HttpModule],
})
export class InfraModule {}
