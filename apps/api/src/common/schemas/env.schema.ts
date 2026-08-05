import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production'], {
    message: 'NODE_ENV deve ser "development", "test" ou "production".',
  }),
  PORT: z.coerce.number().int().positive({ message: 'APP_PORT inválido.' }),
  APP_NAME: z.string().nonempty({ message: 'APP_NAME não pode estar vazio.' }),  
  APP_BASE_URL: z.string().url({ message: 'APP_BASE_URL deve ser uma URL válida.' }),
  DATABASE_URL: z
    .string({
      message: 'DATABASE_URL é obrigatória',
    })
    .url({ message: 'DATABASE_URL deve ser uma URL válida.' }),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASS: z.string(),
  DATABASE_NAME: z.string(),
});
