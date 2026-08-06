import { CORS_ALLOWED_ORIGINS, DOMAIN_REFERENCE, ROUNDS_OF_HASHING } from '@common/config/app';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { env } from '@/env';
import { PrismaClient } from '../../prisma/generated/client';
import { openAPI } from "better-auth/plugins"

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
	basePath: '/auth',
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: false,
		password: {
			hash: async (password) => bcrypt.hash(password, ROUNDS_OF_HASHING),
			verify: async ({ password, hash }) => bcrypt.compare(password, hash),
		},
	},
	user: {
		modelName: 'User',
		fields: {
			email: 'email',
			name: 'name',
			emailVerified: 'emailVerified',
		},
		additionalFields: {
			role: {
				type: 'string',
				input: false,
			}
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const returned = ctx.context.returned;
			if (returned instanceof APIError) {
				throw formatAuthError(returned, ctx.path);
			}
		}),
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ['x-client-ip', 'x-forwarded-for'],
		},
		crossSubDomainCookies: {
			enabled: env.NODE_ENV === 'production',
			domain: DOMAIN_REFERENCE,
		},
	},
	trustedOrigins: CORS_ALLOWED_ORIGINS,
	appName: 'Kikos',	
	plugins: [openAPI()]
});

export function formatAuthError(error: APIError, path?: string) {
	const statusCode = error.statusCode;
	const status = error.status;

	const code = error.body?.code;
	const translated = code && code in AUTH_ERROR_TRANSLATE ? AUTH_ERROR_TRANSLATE[code as AuthErrorCode] : undefined;

	const message = translated ?? error.body?.message ?? error.message;
	const errorCode = error.body?.error ?? error.body?.code ?? 'AUTH_ERROR';

	return new APIError(status, {
		...error.body,
		success: false,
		code: statusCode as unknown as string,
		timestamp: new Date().toISOString(),
		path,
		message,
		error: errorCode,
	});
}

type AuthErrorCode = keyof typeof auth.$ERROR_CODES;
const AUTH_ERROR_TRANSLATE: Partial<Record<AuthErrorCode, string>> = {
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'E-mail já cadastrado',
	INVALID_EMAIL_OR_PASSWORD: 'Verifique suas credenciais e tente novamente.',
	USER_NOT_FOUND: 'Usuário não encontrado',
	ACCOUNT_NOT_FOUND: 'Conta não encontrada',
} as const;
