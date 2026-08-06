import { UserRole } from '@kikos/shared';
import { SetMetadata } from '@nestjs/common';

export const USER_ROLE = 'ROLES';
export const UserRoles = (...args: UserRole[]) => SetMetadata(USER_ROLE, args);
