import { ActivitiesModule } from '@module/activities/activities.module';
import { CommentsModule } from '@module/comments/comments.module';
import { DashboardModule } from '@module/dashboard/dashboard.module';
import { DealsModule } from '@module/deals/deals.module';
import { LeadsModule } from '@module/leads/leads.module';
import { SellersModule } from '@module/sellers/sellers.module';
import { UsersModule } from '@module/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    ActivitiesModule,
    CommentsModule,
    DashboardModule,
    DealsModule,
    LeadsModule,
    SellersModule
  ],
})
export class HttpModule { }
