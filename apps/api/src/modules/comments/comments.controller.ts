import { CreateCommentSchema, ListCommentsQuerySchema, UserRole } from '@kikos/shared';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { createZodDto } from 'nestjs-zod';
import { AuthContext } from '@common/utils/authorization.util';
import { CommentsService } from './comments.service';

export class CreateCommentDtoClass extends createZodDto(CreateCommentSchema) {}
export class ListCommentsQueryDtoClass extends createZodDto(ListCommentsQuerySchema) {}

function toAuthContext(session: UserSession): AuthContext {
  return {
    userId: session.user.id,
    role: (session.user as { role?: UserRole }).role as UserRole,
  };
}

@ApiTags('Comentários')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/leads/:id/comments')
  async listByLead(
    @Param('id') leadId: string,
    @Query() query: ListCommentsQueryDtoClass,
    @Session() session: UserSession,
  ) {
    return this.commentsService.listByLead(leadId, query, toAuthContext(session));
  }

  @Post('/leads/:id/comments')
  async createForLead(
    @Param('id') leadId: string,
    @Body() data: CreateCommentDtoClass,
    @Session() session: UserSession,
  ) {
    return this.commentsService.createForLead(leadId, data, toAuthContext(session));
  }

  @Get('/deals/:id/comments')
  async listByDeal(
    @Param('id') dealId: string,
    @Query() query: ListCommentsQueryDtoClass,
    @Session() session: UserSession,
  ) {
    return this.commentsService.listByDeal(dealId, query, toAuthContext(session));
  }

  @Post('/deals/:id/comments')
  async createForDeal(
    @Param('id') dealId: string,
    @Body() data: CreateCommentDtoClass,
    @Session() session: UserSession,
  ) {
    return this.commentsService.createForDeal(dealId, data, toAuthContext(session));
  }

  @Delete('/comments/:id')
  async delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.commentsService.delete(id, toAuthContext(session));
  }
}
