import { SignInRequestSchema } from '@kikos/shared';
import { createZodDto } from 'nestjs-zod';

export class SignInRequestDto extends createZodDto(SignInRequestSchema) {}
