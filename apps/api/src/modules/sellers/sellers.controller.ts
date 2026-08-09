import { ListSellersQuerySchema, UserRole } from '@kikos/shared';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { createZodDto } from 'nestjs-zod';
import { AuthContext } from '@common/utils/authorization.util';
import { SellersService } from './sellers.service';

class ListSellersQueryDtoClass extends createZodDto(ListSellersQuerySchema) { }

function toAuthContext(session: UserSession): AuthContext {
  return {
    userId: session.user.id,
    role: (session.user as { role?: UserRole }).role as UserRole,
  };
}

@ApiTags('Vendedores')
@Controller('/sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) { }

  @Get()
  async list(@Query() query: ListSellersQueryDtoClass, @Session() session: UserSession) {
    console.log('QUERY:', query);
    console.log('PAGE:', query.page);
    console.log('PAGE SIZE:', query.pageSize);
    return this.sellersService.list(query, toAuthContext(session));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Session() session: UserSession) {
    return this.sellersService.getById(id, toAuthContext(session));
  }
}
