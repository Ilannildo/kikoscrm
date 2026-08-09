import {
  CreateLeadSchema,
  ListLeadsQuerySchema,
  UpdateLeadSchema,
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
import { Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { createZodDto } from 'nestjs-zod';
import { AuthContext } from '@common/utils/authorization.util';
import { LeadsService } from './leads.service';

class CreateLeadDtoClass extends createZodDto(CreateLeadSchema) {}
class UpdateLeadDtoClass extends createZodDto(UpdateLeadSchema) {}
class ListLeadsQueryDtoClass extends createZodDto(ListLeadsQuerySchema) {}

function toAuthContext(session: UserSession): AuthContext {
  return {
    userId: session.user.id,
    role: (session.user as { role?: UserRole }).role as UserRole,
  };
}

@ApiTags('Leads')
@Controller('/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(@Query() query: ListLeadsQueryDtoClass, @Session() session: UserSession) {
    return this.leadsService.list(query, toAuthContext(session));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Session() session: UserSession) {
    return this.leadsService.getById(id, toAuthContext(session));
  }

  @Post()
  async create(@Body() data: CreateLeadDtoClass, @Session() session: UserSession) {    
    return this.leadsService.create(data, toAuthContext(session));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateLeadDtoClass,
    @Session() session: UserSession,
  ) {
    return this.leadsService.update(id, data, toAuthContext(session));
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.leadsService.delete(id, toAuthContext(session));
  }
}
