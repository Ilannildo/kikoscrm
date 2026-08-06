import {
  CreateDealSchema,
  ListDealsQuerySchema,
  UpdateDealSchema,
  UpdateDealStatusSchema,
  UserRole,
} from '@kikos/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { createZodDto } from 'nestjs-zod';
import { AuthContext } from '@common/utils/authorization.util';
import { DealsService } from './deals.service';

class CreateDealDtoClass extends createZodDto(CreateDealSchema) {}
class UpdateDealDtoClass extends createZodDto(UpdateDealSchema) {}
class UpdateDealStatusDtoClass extends createZodDto(UpdateDealStatusSchema) {}
class ListDealsQueryDtoClass extends createZodDto(ListDealsQuerySchema) {}

function toAuthContext(session: UserSession): AuthContext {
  return {
    userId: session.user.id,
    role: (session.user as { role?: UserRole }).role as UserRole,
  };
}

@ApiTags('Negócios')
@Controller('/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  async list(@Query() query: ListDealsQueryDtoClass, @Session() session: UserSession) {
    return this.dealsService.list(query, toAuthContext(session));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Session() session: UserSession) {
    return this.dealsService.getById(id, toAuthContext(session));
  }

  @Post()
  async create(@Body() data: CreateDealDtoClass, @Session() session: UserSession) {
    return this.dealsService.create(data, toAuthContext(session));
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() data: UpdateDealStatusDtoClass,
    @Session() session: UserSession,
  ) {
    return this.dealsService.changeStatus(id, data, toAuthContext(session));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateDealDtoClass,
    @Session() session: UserSession,
  ) {
    return this.dealsService.update(id, data, toAuthContext(session));
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.dealsService.delete(id, toAuthContext(session));
  }
}
