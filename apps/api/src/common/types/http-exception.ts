import { Codes } from '@kikos/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const httpExceptionSchema = z.object({  
  timestamp: z.iso.datetime(),
  path: z.string(),
  message: z.string(),
  code: z.nativeEnum(Codes),
});

export class HttpExceptionDto extends createZodDto(httpExceptionSchema) {}
