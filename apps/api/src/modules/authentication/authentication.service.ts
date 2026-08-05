import { SendMailQueueProducer } from '@/services/send-mail/send-mail.producer.service';
import { UserSettingsRepository } from '@infra/database/repositories/user-settings.repository';
import { UsersRepository } from '@infra/database/repositories/users.repository';
import { mapGetUserToResponse } from '@module/users/users.mapper';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Codes, formatErrorMessage, UserStatus } from '@kikos/shared';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/request/sign-in-request.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private usersRepository: UsersRepository,
    private userSettingsRepository: UserSettingsRepository,
    private sendMailQueueProducer: SendMailQueueProducer,
  ) {}

  async signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = signInDto;

    const lowercaseEmail = email.toLowerCase();

    const user = await this.usersRepository.get({
      where: { email: { equals: lowercaseEmail, mode: 'insensitive' } },
    });

    await this.sendMailQueueProducer.welcome({
      email,
      name: 'Ilannildo Viana',
      userId: '123',
    });

    if (!user) {
      throw new UnauthorizedException(
        formatErrorMessage(Codes.AUTH__UNEXPECTED_AUTHORIZATION),
        {
          cause: new Error(Codes.AUTH__UNEXPECTED_AUTHORIZATION),
        },
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(
        formatErrorMessage(Codes.AUTH__USER_DISABLED),
        {
          cause: new Error(Codes.AUTH__USER_DISABLED),
        },
      );
    }

    const userSettings = await this.userSettingsRepository.get({
      where: { userId: user.id },
    });

    if (!userSettings?.emailVerifiedAt) {
      // TODO: send confirmation email
      // await this.authenticationService.sendConfirmationAccountEmail(user);

      throw new UnauthorizedException(
        formatErrorMessage(Codes.AUTH__USER_NOT_ACTIVATED),
        {
          cause: new Error(Codes.AUTH__USER_NOT_ACTIVATED),
        },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user?.password);
    if (!passwordMatch) {
      throw new UnauthorizedException(
        formatErrorMessage(Codes.AUTH__UNEXPECTED_AUTHORIZATION),
        {
          cause: new Error(Codes.AUTH__UNEXPECTED_AUTHORIZATION),
        },
      );
    }

    const accessToken = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: mapGetUserToResponse(user),
    };
  }
}
