import { UserEntity } from '@infra/entities/user.entity';
import { UserResponseDto } from './dto/response/user-response.dto';

export function mapGetUserToResponse(user: UserEntity): UserResponseDto {

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    updatedAt: user.updatedAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}

export function mapListUsersToResponse(users: UserEntity[]): UserResponseDto[] {
  return users.map((user) => mapGetUserToResponse(user));
}
