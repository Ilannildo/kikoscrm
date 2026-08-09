# Kikos CRM

CRM para gestão de **leads** e **negócios** de um time comercial, desenvolvido como desafio técnico Fullstack (TypeScript) para a **Kikos Fitness**.

Monorepo com **frontend** (Next.js 15) e **backend** (NestJS 11), camada de dados compartilhada, CI/CD e infraestrutura declarativa para Kubernetes.

---

## Stack

| Camada | Tecnologias |
| ------ | ----------- |
| Monorepo | pnpm workspaces + Turborepo |
| Backend | NestJS 11, Prisma 7 (PostgreSQL), Better Auth, Zod, nestjs-zod, Helmet, pino, Swagger/Scalar |
| Frontend | Next.js 15, React 19, tRPC 11, TanStack Query, axios, react-hook-form, Tailwind v4, dnd-kit |
| Compartilhado | `@kikos/shared` (schemas Zod, enums, DTOs) · `@kikos/ui` (componentes) |
| Infra | Docker, docker-compose, Kubernetes, Traefik Gateway, cert-manager |

---

## Como rodar localmente

### Pré-requisitos
- Node.js v25.4.0 (`.nvmrc`)
- pnpm 10+ (`corepack enable`)
- Docker (para subir o banco)

### 1. Instalar dependências

```sh
pnpm install
```

### 2. Variáveis de ambiente

Crie um `.env` em `apps/api`:

```
NODE_ENV=development
PORT=3000
APP_NAME=kikos
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://kikos:kikos@localhost:5432/kikos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=kikos
DATABASE_PASS=kikos
DATABASE_NAME=kikos
BETTER_AUTH_SECRET=qualquer-segredo
BETTER_AUTH_URL=http://localhost:3000
```

E em `apps/web`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Banco de dados (docker-compose)

Subindo PostgreSQL + PgBouncer + Redis:

```sh
cd apps/api
docker compose up -d
```

### 4. Migrations

```sh
cd apps/api
pnpm prisma migrate dev
```

> Em produção, a migração é executada via Job de Kubernetes (`prisma migrate deploy`).

### 5. Seed

```sh
cd apps/api
pnpm prisma db seed
```

O seed cria usuários de exemplo (senha de todos: **`12345678`**):

- Admin: `admin@kikosfitness.com.br`
- Vendedores: `carlos@`, `mariana@`, `rafael@`, `juliana@` — todos `@kikosfitness.com.br`

Também cria leads, negócios, comentários e atividades de demonstração. O seed segue o mesmo esquema de hash do Better Auth (senha em `Account`), mantendo compatibilidade com o login.

### 6. Desenvolvimento

```sh
# Na raiz — roda API e Web em paralelo
pnpm dev
```

- **Web**: `http://localhost:3000`
- **API**: porta definida por `PORT` no `.env` do backend (padrão `3000`; em produção o container usa `8082`)

> Ajuste `NEXT_PUBLIC_API_URL` no `.env` do web para apontar para a API em desenvolvimento.

### Build e produção

```sh
pnpm build                # build do monorepo

# Backend
cd apps/api && pnpm start:prod

# Web
cd apps/web && pnpm start
```

---

## Funcionalidades

- Login / logout com sessão por cookie.
- CRUD de **leads** (busca, filtros, paginação).
- CRUD de **negócios** vinculados a lead e vendedor.
- **Board Kanban** com uma coluna por status e drag & drop.
- Transição de status validada (máquina de estados) no cliente e servidor.
- Marcar negócio como **ganho** ou **perdido**.
- **Comentários** em leads e negócios.
- **Dashboard** com KPIs, pipeline e atividades recentes.

---

## Checklist do desafio

### Obrigatórios

- [x] Login / logout
- [x] Criar lead
- [x] Criar negócio
- [x] Vincular negócio a um lead
- [x] Status do negócio no funil
- [x] Marcar como ganho / perdido
- [x] Vincular negócio a um vendedor
- [x] Comentários em lead e/ou negócio
- [x] Board Kanban (coluna por status, transição)
- [x] Visualização de detalhes
- [x] Comentários a partir do Kanban
- [x] Ações de ganho/perda a partir do negócio

### Diferenciais

- [x] Aplicação hospedada — infra configurada (Kubernetes + CI/CD)
- [~] Testes automatizados — parciais (transição de status + bootstrap e2e)
- [~] Programação funcional — parcial (domínio puro, sem Effect-TS/fp-ts)
- [ ] Integração com IA
- [ ] Effect-TS / fp-ts

---

## Arquitetura

Arquitetura **modular em camadas** com separação clara de responsabilidades:

```
apps/web (Next.js)
  Páginas → Componentes → tRPC routers (BFF) → services (axios → REST)
                                                      │
apps/api (NestJS)                                      ▼
  Controllers → Services → domain/ (regras puras) → infra/ (Prisma, HTTP, Logger)
                                                      │
                                               PostgreSQL
```

- **`packages/shared`** — fonte única de schemas Zod, enums e DTOs (tipagem compartilhada).
- **`packages/ui`** — componentes de UI (Radix + Tailwind).
- **Controllers** expõem REST; **Services** orquestram casos de uso; **`domain/`** isola regras puras (ex.: transição de status de negócio); **`infra/`** encapsula banco, HTTP, logger e resposta padronizada.
- **Autorização por papel**: `admin`/`seller`, com checagem de propriedade do recurso (`isAdmin`, `assertSellerAccess`).

---

## Banco de dados

**PostgreSQL** + **Prisma 7**. Entidades: `User`, `Session`, `Account`, `Verification`, `Lead`, `Deal`, `Comment`, `Activity`.

Principais relacionamentos:

- `User` (`admin`/`seller`) → `Session`, `Account`, `Lead`, `Deal`, `Comment`, `Activity`
- `Lead` 1—N `Deal` · `Lead` 1—N `Comment` · `Deal` 1—N `Comment`
- `Activity` registra eventos do feed (criação, mudança de status, ganho/perda, comentário)

Enums: `UserRole`, `LeadStatus`, `DealStatus`, `ActivityType`.

**Regra de domínio** — transição de status do negócio (máquina de estados em `domain/deals`):

```
new → in_progress → won | lost
new → won/lost (não permitido) · won/lost (terminal)
```

---

## Autenticação

**Better Auth** integrado ao NestJS (`@nestjs-better-auth`). Email/senha com hash **bcrypt** (10 rounds), sessão por cookie (incluindo cross-subdomain em produção), rastreamento de IP e `AuthGuard` global. No frontend, `middleware.ts` protege rotas e valida papéis.

## Validação e erros

- **Zod** como fonte de verdade: `ZodValidationPipe` no backend e react-hook-form + zod no frontend.
- **Resposta padronizada**: `ResponseInterceptor` → `{ success, data, code, path, timestamp }`.
- **Erros normalizados**: `HttpExceptionFilter` → `{ timestamp, path, message, code }`, com mensagens em pt-BR via `Codes`.

---

## Testes

- **Unit** (Jest): transição de status (`deal-status.transition.spec.ts`).
- **E2E** (supertest): bootstrap do app (`GET /`).

```sh
cd apps/api
pnpm test        # unit
pnpm test:e2e    # e2e
pnpm test:cov    # cobertura
```

Cobertura ainda limitada: sem testes de services, controllers, autorização e frontend.

---

## Infraestrutura e CI/CD

- **Docker**: `docker/api.Dockerfile` e `docker/web.Dockerfile` (multi-stage com `turbo prune`); `docker-compose.yml` para Postgres + PgBouncer + Redis.
- **Kubernetes** (`infra/k8s`): namespace `kikos`, deployments (2 réplicas), services, configmaps, secrets (templates), job de migração Prisma, **Traefik Gateway** (HTTP/HTTPS) e **cert-manager** (Let's Encrypt).
- **CI/CD** (`.github/workflows/deploy.yml`): push em `main` → build + push de imagens para **GHCR** → aplica manifests → roda migração Prisma → rollout → configura Gateway + TLS.

---

## Decisões técnicas

- **Monorepo (pnpm + Turborepo)**: centraliza dependências, compartilha configs e permite que `@kikos/shared` seja a fonte única de contratos entre frontend e backend, evitando drift de tipos.
- **NestJS no backend**: estrutura modular com DI, decorators e ecossistema maduro para APIs REST com separação clara de responsabilidades.
- **Next.js + tRPC como BFF**: tipa as chamadas frontend→services, mantendo o backend como API REST independente e reutilizável.
- **Prisma + PostgreSQL**: schema declarativo, migrations versionadas e tipagem forte. Uso do driver `@prisma/adapter-pg` para gerenciamento de conexão.
- **Zod como fonte de verdade**: validação de entrada e tipos derivados compartilhados.
- **Better Auth**: sessão por cookie, hashing de senha e guard global, com modelo de dados padronizado.
- **Domínio puro**: regras de transição de status isoladas em funções puras, testáveis e independentes do framework.
- **Autorização por papel + propriedade**: `admin` gerencia tudo; vendedores acessam apenas seus dados.
- **Infra declarativa**: Kubernetes + Gateway API + cert-manager versionados, com deploy reproduzível via CI/CD.

### Trade-offs

- `strict: false` no `apps/api/tsconfig.json` (recomendado migrar para strict).
- tRPC duplica parte da validação dos schemas compartilhados.
- Programação funcional parcial (domínio puro) sem Effect-TS/fp-ts.
- Sem integração de IA.
- Testes limitados (domínio + bootstrap e2e).
- BullMQ/Redis presentes no `package.json`/compose, mas sem filas efetivas no código.

---

## Melhorias futuras

- Ampliar testes (services, controllers, autorização, componentes, E2E).
- TypeScript strict no backend.
- Integração com IA (classificar leads, sugerir próximos passos).
- Adoção de Effect-TS/fp-ts na camada de domínio.
- Uso efetivo de filas (BullMQ) para processamento assíncrono.
- Observabilidade (métricas, tracing, alertas).

---

## Checklist de requisitos

| Área | Cobertura | Observação |
| ---- | --------- | ---------- |
| Autenticação | ✅ | Login/logout, sessão, registro, guard + middleware |
| Leads | ✅ | CRUD, busca, filtros, paginação, comentários |
| Negócios | ✅ | CRUD, vínculo a lead/vendedor, ganho/perdido |
| Vendedores | ✅ | Listagem com métricas e criação (admin) |
| Kanban | ✅ | Colunas por status, drag & drop, transição validada |
| Comentários | ✅ | Em leads e negócios, com autorização |
| Dashboard | ✅ | KPIs, pipeline, atividades recentes |
| IA | ❌ | Não implementado |
| Programação funcional | 🟡 | Domínio puro; sem Effect-TS/fp-ts |
| Testes | 🟡 | Transição de status + bootstrap e2e |
| Infraestrutura | ✅ | Docker, K8s, Traefik, cert-manager |
| CI/CD | ✅ | GitHub Actions → GHCR → K8s → migração → TLS |
