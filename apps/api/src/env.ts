import 'dotenv/config';

import { envSchema } from '@common/schemas/env.schema';
import { z } from 'zod';

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Configuração de ambiente inválida:');
  error.errors.forEach((err) => {
    console.error(`${err.path} - ${err.message}`);
  });
  process.exit(1); // Encerra o processo com erro
}

export { env };
