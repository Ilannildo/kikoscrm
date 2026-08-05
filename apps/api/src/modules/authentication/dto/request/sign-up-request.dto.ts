import { SignUpRequestSchema } from '@kikos/shared';
import { createZodDto } from 'nestjs-zod';

export class SignUpRequestDto extends createZodDto(SignUpRequestSchema) {}
