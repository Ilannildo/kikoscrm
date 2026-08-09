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

RUN turbo prune web --docker


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

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL

ENV SKIP_ENV_VALIDATION=1

RUN pnpm --version

RUN pnpm turbo run build --filter=web...


# ============================================================
# RUNTIME
# ============================================================

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]