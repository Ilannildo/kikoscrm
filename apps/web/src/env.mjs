import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    BETTER_AUTH_URL: z.string(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.string(),
		NEXT_PUBLIC_API_URL: z.string(),
		NEXT_PUBLIC_URL: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
