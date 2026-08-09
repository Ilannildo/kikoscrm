# syntax=docker/dockerfile:1.7

# ============================================================
# BASE
# ============================================================

FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@10.18.3 --activate


# ============================================================
# PRUNER
# ============================================================

FROM base AS pruner

RUN pnpm add --global turbo

COPY . .

RUN turbo prune api --docker


# ============================================================
# INSTALL
# ============================================================

FROM base AS installer

COPY --from=pruner /app/out/json/ ./

RUN pnpm install --frozen-lockfile


# ============================================================
# BUILD
# ============================================================

FROM base AS builder

COPY --from=installer /app/ ./

COPY --from=pruner /app/out/full/ ./

RUN pnpm turbo run build --filter=api...


# ============================================================
# RUNTIME
# ============================================================

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache postgresql17-client

RUN corepack enable \
    && corepack prepare pnpm@10.18.3 --activate


# Production dependencies
COPY --from=installer /app/ ./

# Código compilado
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts


WORKDIR /app/apps/api

EXPOSE 8082

CMD ["node", "dist/src/main.js"]