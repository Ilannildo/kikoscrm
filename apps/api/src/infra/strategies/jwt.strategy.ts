import { env } from '@/env';
import { UsersRepository } from '@infra/database/repositories/users.repository';
import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Codes, formatErrorMessage } from '@kikos/shared';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepository.get({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        formatErrorMessage(Codes.AUTH__USER_NOT_AUTHORIZED),
        {
          cause: Codes.AUTH__USER_NOT_AUTHORIZED,
        },
      );
    }

    return user;
  }
}
