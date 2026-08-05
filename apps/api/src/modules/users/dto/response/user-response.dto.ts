import { UserSchema } from '@kikos/shared';
import { createZodDto } from 'nestjs-zod';

export class UserResponseDto extends createZodDto(UserSchema) {}
