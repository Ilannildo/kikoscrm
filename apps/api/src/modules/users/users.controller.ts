import { UserRoleGuard } from '@common/guards/user-role.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '@common/types/authenticated-request';
import { CreateUserDto } from './dto/request/create-user.dto';
import { LogsService } from '@module/logs/logs.service';
import { IpAddress } from '@common/decorators/ip-address.decorator';
import { LogAction, LogEntity, Role } from '@kikos/shared';
import { UserRoles } from '@common/decorators/user-role.decorator';

@ApiTags('Usuários')
@UseGuards(UserRoleGuard)
@UseGuards(AuthGuard('jwt'))
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private logsService: LogsService,
  ) {}

  @Get('/me')
  async me(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    return this.usersService.get(user.id);
  }

  @UserRoles(Role.ADMIN)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @IpAddress() ipAddress: string,
    @Body() data: CreateUserDto,
  ) {
    const response = await this.usersService.create(data, req.user.companyId);

    await this.logsService.create({
      action: LogAction.CREATE,
      entity: LogEntity.USER,
      userId: req.user.id,
      companyId: req.user.companyId,
      body: data,
      description: `${req.user.name} criou o usuário ${response.name}`,
      ipAddress,
    });

    return response;
  }
}
