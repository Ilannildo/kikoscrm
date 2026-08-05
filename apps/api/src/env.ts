import { config } from 'dotenv';
import { z } from 'zod';

import { envSchema } from '@common/schemas/env.schema';
config();

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Configuração de ambiente inválida:');
    error.issues.forEach((err) => {
      console.error(`${err.path} - ${err.message}`);
    });
    process.exit(1); // Encerra o processo com erro
  } else {
    throw error; // Re-lança erros inesperados
  }
}

export { env };
