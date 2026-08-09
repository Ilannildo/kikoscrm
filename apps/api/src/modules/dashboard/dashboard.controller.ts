import { UserRole } from '@kikos/shared';
import { DashboardQuerySchema } from '@kikos/shared';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { createZodDto } from 'nestjs-zod';
import { AuthContext } from '@common/utils/authorization.util';
import { DashboardService } from './dashboard.service';

class DashboardQueryDtoClass extends createZodDto(DashboardQuerySchema) {}

function toAuthContext(session: UserSession): AuthContext {
  return {
    userId: session.user.id,
    role: (session.user as { role?: UserRole }).role as UserRole,
  };
}

@ApiTags('Dashboard')
@Controller('/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async get(@Query() query: DashboardQueryDtoClass, @Session() session: UserSession) {
    return this.dashboardService.get(query, toAuthContext(session));
  }
}
