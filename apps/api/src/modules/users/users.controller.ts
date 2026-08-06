import { UserRoles } from '@common/decorators/user-role.decorator';
import { UserRole } from '@kikos/shared';
import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('Usuários')
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Get('/me')
  async me(@Session() session: UserSession) {
    const user = session.user;
    return this.usersService.get(user.id);
  }

  @UserRoles(UserRole.admin)
  @Post('/')
  async create(
    @Body() data: CreateUserDto,
  ) {
    const response = await this.usersService.create(data);


    return response;
  }
}
