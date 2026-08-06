import { getErrorMessage } from '@common/filters/http-exception.filter';
import { PrismaService } from '@infra/database/prisma.service';
import { Codes } from '@kikos/shared';
import {
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/request/create-user.dto';
import { mapGetUserToResponse } from './users.mapper';
import { ROUNDS_OF_HASHING } from '@common/config/app';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
  ) { }

  async get(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      }
    });

    if (!user) {
      throw new HttpException(getErrorMessage(Codes.AUTH__USER_NOT_FOUND), HttpStatus.NOT_FOUND);
    }

    return mapGetUserToResponse(user);
  }


  async create(data: CreateUserDto) {
    const password = data.password;

    const emailLowercase = data.email.toLowerCase();

    const userAlreadyExistsByEmail = await this.prismaService.user.findFirst({
      where: {
        email: {
          equals: emailLowercase,
          mode: 'insensitive',
        },
      },
    });

    if (userAlreadyExistsByEmail)
      throw new HttpException(getErrorMessage(Codes.AUTH__EMAIL_ALREADY_IN_USE), HttpStatus.BAD_REQUEST);

    const passwordHash = await bcrypt.hash(password, bcrypt.genSaltSync(ROUNDS_OF_HASHING));

    const user = await this.prismaService.user.create({
      data: {
        email: emailLowercase,
        name: data.name,
        password: passwordHash,
        role: data.role,
      },
    });

    return mapGetUserToResponse(user);
  }
}
