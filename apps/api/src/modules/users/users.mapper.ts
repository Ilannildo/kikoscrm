import { User } from '@kikos/db';
import { UserResponseDto } from './dto/response/user-response.dto';

export function mapGetUserToResponse(user?: User): UserResponseDto | undefined {
  if (!user) return;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
    status: user.status,
  };
}

export function mapListUsersToResponse(users: User[]): UserResponseDto[] {
  return users.map((user) => mapGetUserToResponse(user));
}
