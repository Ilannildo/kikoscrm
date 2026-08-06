import { UsersModule } from '@module/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
  ],
})
export class HttpModule { }
