import { SignInResponseSchema } from '@kikos/shared';
import { createZodDto } from 'nestjs-zod';

export class SignInResponseDto extends createZodDto(SignInResponseSchema) {}
