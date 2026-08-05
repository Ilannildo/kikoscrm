import { UsersRepository } from '@infra/database/repositories/users.repository';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mapGetUserToResponse } from './users.mapper';
import { CreateUserDto } from './dto/request/create-user.dto';
import { Codes, formatErrorMessage } from '@kikos/shared';
import { UserSettingsRepository } from '@infra/database/repositories/user-settings.repository';
import { UserProfilesRepository } from '@infra/database/repositories/user-profiles.repository';
import slugify from 'slugify';
import { UserResponseDto } from './dto/response/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private userSettingsRepository: UserSettingsRepository,
    private userProfilesRepository: UserProfilesRepository,
  ) {}

  async get(userId: string) {
    const user = await this.usersRepository.get({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        formatErrorMessage(Codes.AUTH__USER_NOT_FOUND),
        {
          cause: new Error(Codes.AUTH__USER_NOT_FOUND),
        },
      );
    }

    return mapGetUserToResponse(user);
  }

  async create(
    data: CreateUserDto,
    companyId: string,
  ): Promise<UserResponseDto> {
    const { email, name, role, profile, settings, status } = data;

    const lowercaseEmail = email.toLowerCase();

    const userAlreadyExists = await this.usersRepository.get({
      where: { email: { equals: lowercaseEmail, mode: 'insensitive' } },
    });

    if (userAlreadyExists) {
      throw new BadRequestException(
        formatErrorMessage(Codes.AUTH__EMAIL_ALREADY_IN_USE),
        {
          cause: new Error(Codes.AUTH__EMAIL_ALREADY_IN_USE),
        },
      );
    }

    const user = await this.usersRepository.create({
      company: { connect: { id: companyId } },
      email: lowercaseEmail,
      name,
      role,
      status,
    });

    const username = slugify(profile?.username || user.name, {
      lower: true,
      strict: true,
    });

    if (profile) {
      await this.userProfilesRepository.create({
        user: { connect: { id: user.id } },
        document: profile.document,
        username: username,
        documentType: profile.documentType,
        maritalStatus: profile?.maritalStatus,
        nationality: profile?.nationality,
        profession: profile?.profession,
        phone: profile?.phone,
      });
    }

    if (!profile) {
      await this.userProfilesRepository.create({
        user: { connect: { id: user.id } },
        username: username,
      });
    }

    if (settings) {
      await this.userSettingsRepository.create({
        user: { connect: { id: user.id } },
        configurationStatus: settings?.configurationStatus,
        locale: settings?.locale,
        maxCommission: settings?.maxCommission,
        minCommission: settings?.minCommission,
        timezone: settings?.timezone,
      });
    }

    if (!settings) {
      await this.userSettingsRepository.create({
        user: { connect: { id: user.id } },
      });
    }

    return mapGetUserToResponse(user);
  }
}
