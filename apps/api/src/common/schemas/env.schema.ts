import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production'], {
    message: 'NODE_ENV deve ser "development", "test" ou "production".',
  }),
  APP_VERSION: z
    .string()
    .nonempty({ message: 'APP_VERSION não pode estar vazio.' }),
  APP_PORT: z.coerce.number().int().positive({ message: 'APP_PORT inválido.' }),
  REDIS_URL: z
    .string({
      message: 'DATABASE_URL é obrigatória',
    })
    .nonempty(),
  APP_NAME: z.string().nonempty({ message: 'APP_NAME não pode estar vazio.' }),
  JWT_SECRET_KEY: z.string().min(32, {
    message: 'JWT_SECRET_KEY deve ter pelo menos 32 caracteres.',
  }),
});
