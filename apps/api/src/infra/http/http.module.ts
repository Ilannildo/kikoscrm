import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@module/authentication/authentication.module';
import { UsersModule } from '@module/users/users.module';
import { LogsModule } from '@module/logs/logs.module';

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    LogsModule
  ],
})
export class HttpModule {}
