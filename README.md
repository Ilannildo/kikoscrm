# Kikos CRM

CRM (Customer Relationship Management) para gestão de **leads** e **negócios** de um time comercial, desenvolvido como desafio técnico para **Desenvolvedor(a) TypeScript · Fullstack** da **Kikos Fitness**.

O projeto é um **monorepo** que entrega um **frontend** (Next.js) e um **backend** (NestJS) com camada de dados compartilhada, pipelines de CI/CD e infraestrutura declarativa para Kubernetes.

---

## Sobre o projeto

O Kikos CRM permite a um time de vendas:

- Autenticar (login/logout) com controle de sessão.
- Cadastrar e gerenciar **leads** (prospecção).
- Cadastrar e gerenciar **negócios**, vinculados a um lead e a um vendedor.
- Acompanhar o **funil de vendas** por meio de um **board Kanban**.
- Transicionar negócios entre status, respeitando regras de domínio.
- Marcar negócios como **ganho** ou **perdido**.
- Registrar **comentários** em leads e negócios.
- Visualizar um **dashboard** com KPIs, pipeline e atividades recentes.

O frontend consome a API REST do backend através de uma camada **BFF (tRPC)** que roda no mesmo servidor Next.js.

---

## Desafio técnico

Desafio de construção de um CRM simples para um time comercial, com entrega em monorepo contendo frontend e backend. Os requisitos e diferenciais do desafio, e a cobertura real da implementação, estão detalhados na seção [Checklist do desafio](#checklist-do-desafio).

---

## Funcionalidades

| Área | Descrição |
| ---- | --------- |
| **Autenticação** | Login, logout, registro de conta e sessão persistida via cookie. |
| **Leads** | CRUD de leads com busca, filtros por status/vendedor e paginação. |
| **Negócios** | CRUD de negócios com valor, descrição, vínculo a lead e vendedor. |
| **Kanban** | Board com uma coluna por status, arrastar-e-soltar de cards e transição validada. |
| **Comentários** | Comentários em leads e negócios, com histórico por entidade. |
| **Vendedores** | Listagem de vendedores com métricas de desempenho (negócios, valor de pipeline, ganho). |
| **Dashboard** | KPIs (leads, pipeline, ganho, conversão), resumo do funil, negócios e atividades recentes. |
| **Histórico** | Feed de atividades (criação, atualização, mudança de status, ganho/perda, comentário). |

---

## Checklist do desafio

### Obrigatórios

- [x] Login / logout
- [x] Criar lead
- [x] Criar negócio
- [x] Vincular negócio a um lead
- [x] Status do negócio ao longo do funil
- [x] Marcar negócio como ganho
- [x] Marcar negócio como perdido
- [x] Vincular negócio a um vendedor
- [x] Comentários em lead e/ou negócio
- [x] Board Kanban
- [x] Uma coluna por status
- [x] Transição de negócios entre status
- [x] Visualização de detalhes
- [x] Comentários a partir do fluxo do Kanban
- [x] Ações de ganho/perda a partir do negócio

### Diferenciais

- [ ] Integração com IA
- [~] Testes automatizados — parcialmente implementados (apenas transição de status e bootstrap e2e)
- [x] Aplicação hospedada — infraestrutura de deploy configurada (Kubernetes + CI/CD)
- [~] Programação funcional — parcial (funções puras no domínio; sem Effect-TS/fp-ts)
- [ ] Effect-TS / fp-ts

> **Nota sobre diferenciais:** a aplicação não possui integração com IA e não utiliza as bibliotecas Effect-TS ou fp-ts. Os conceitos funcionais presentes (funções puras, imutabilidade, tratamento explícito de erros) estão concentrados na camada de domínio. A infraestrutura de deploy está **configurada** via Kubernetes e GitHub Actions, mas depende de um cluster para estar efetivamente em produção.

---

## Arquitetura

O projeto adota uma **arquitetura modular em camadas** com um **monorepo** de pacotes. Não é uma Clean Architecture ou Hexagonal estrita, mas há separação clara de responsabilidades:

```
┌────────────────────────────────────────────────────────────┐
│                        apps/web (Next.js)                  │
│  Páginas (App Router) → Componentes → tRPC routers (BFF)   │
│                                   │                         │
│                                   ▼                         │
│                        Camada de serviços (axios → REST)    │
└───────────────────────────────────┬─────────────────────────┘
                                    │ HTTP (fetch/axios)
┌───────────────────────────────────▼─────────────────────────┐
│                        apps/api (NestJS)                    │
│  Controllers (REST) → Services (casos de uso)               │
│        │                                                     │
│        ├── domain/  (regras de negócio puras)               │
│        └── infra/   (Prisma, HTTP, Logger, Response)        │
│                                    │                         │
└───────────────────────────────────▼─────────────────────────┘
                                    │ Prisma
                              PostgreSQL
```

### Camadas

- **`packages/shared`** — contratos compartilhados entre frontend e backend: schemas Zod, enums, DTOs e tipos derivados. É a fonte única de verdade para a tipagem de API.
- **`packages/ui`** — biblioteca de componentes de UI (Radix + Tailwind) reutilizada pelo web.
- **`apps/api`** — backend NestJS com módulos por domínio (leads, deals, sellers, comments, dashboard, users, activities, health).
  - **Controllers** expõem a API REST.
  - **Services** implementam os casos de uso.
  - **`domain/`** concentra regras de negócio **puras** (transições de status de negócio), sem dependência de framework.
  - **`infra/`** isola detalhes de infraestrutura (acesso a banco via Prisma, logger, HTTP, resposta padronizada).
- **`apps/web`** — frontend Next.js com tRPC como camada BFF que valida e repassa chamadas à API REST.

### Padrões

- **Repository Pattern**: o `PrismaService` (global) encapsula o acesso ao banco.
- **Service Layer**: regras orquestradas em services por módulo.
- **DTOs/Schemas**: validação e serialização via Zod (`nestjs-zod`).
- **BFF**: o frontend usa tRPC routers que chamam services (axios) para a API REST.
- **Autorização por papel**: utilitários puros (`isAdmin`, `assertSellerAccess`, `resolveSellerId`) garantem que um vendedor só acesse seus próprios recursos.

---

## Stack

### Monorepo / Tooling
- pnpm workspaces + Turborepo
- TypeScript 5.8
- ESLint + Prettier (configs compartilhadas em `packages`)
- Node.js v25.4.0 (`.nvmrc`)

### Backend (`apps/api`)
- NestJS 11
- Prisma 7 (PostgreSQL) com driver adaptado (`@prisma/adapter-pg`)
- Better Auth + `@thallesp/nestjs-better-auth` (autenticação/sessão)
- Zod + `nestjs-zod` (validação e serialização)
- `@nestjs/throttler` (rate limiting)
- Helmet (headers de segurança)
- `nestjs-pino` (logging)
- Swagger + Scalar (documentação da API)
- BullMQ/Redis (dependência presente; sem filas efetivamente utilizadas no código de domínio)

### Frontend (`apps/web`)
- Next.js 15 (App Router)
- React 19
- tRPC 11 + TanStack Query (estado de servidor)
- axios (cliente HTTP)
- react-hook-form + Zod (`@hookform/resolvers/zod`)
- Tailwind CSS v4
- `@dnd-kit/core` + `@dnd-kit/sortable` (Kanban drag & drop)
- lucide-react (ícones)
- better-auth client (login/logout)
- `@kikos/ui` (componentes de UI)

---

## Estrutura do projeto

```
.
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── prisma/               # Schema, migrations, seed
│   │   └── src/
│   │       ├── common/           # config, decorators, filters, schemas, types, utils
│   │       ├── domain/           # regras de negócio puras
│   │       ├── infra/            # database, entities, http, logger, response
│   │       ├── lib/              # config do Better Auth
│   │       └── modules/          # leads, deals, sellers, comments, dashboard, users, activities, health
│   └── web/                      # Frontend Next.js
│       └── src/
│           ├── app/              # páginas (App Router) + API routes (tRPC, auth)
│           ├── components/       # componentes por domínio
│           ├── lib/              # utils, auth-client, status
│           ├── server/api/       # tRPC routers (BFF)
│           ├── services/         # camada de acesso à API REST
│           └── trpc/             # client/servidor tRPC
├── packages/
│   ├── shared/                   # schemas, enums, tipos, DTOs compartilhados
│   ├── ui/                       # biblioteca de componentes
│   ├── eslint-config/            # configs de lint compartilhadas
│   └── typescript-config/        # tsconfigs compartilhadas
├── docker/                       # Dockerfiles (api, web)
├── infra/
│   └── k8s/                      # manifests Kubernetes (namespace, api, web, traefik, cert-manager, database)
├── .github/workflows/deploy.yml  # CI/CD
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Frontend

- **Framework**: Next.js 15 (App Router), React 19, renderização no cliente para áreas interativas.
- **Router**: Next.js App Router com rotas protegidas por `middleware.ts`.
- **Estado de servidor/cache**: tRPC + TanStack Query (`@tanstack/react-query`), com invalidação de cache.
- **UI**: biblioteca própria `@kikos/ui` (Radix primitives + Tailwind v4 + `cva`), com design system consistente (botões, inputs, selects, badges, drawer, skeleton, empty/error state, toast).
- **Formulários**: `react-hook-form` + validação Zod via `zodResolver`.
- **Autenticação**: Better Auth client; sessão lida via cookie (SSR) e guard no middleware.
- **Guards**: `middleware.ts` valida rotas públicas vs. protegidas e faz verificação de papel (admin/seller).
- **Integração com API**: camada `services/` com axios (withCredentials + cookie forwarding + IP do cliente) exposta por tRPC routers.
- **Organização**: páginas por domínio (`dashboard`, `leads`, `deals`, `sellers`), componentes reutilizáveis e por domínio, hooks/estado via tRPC.
- **Responsividade**: layout com sidebar responsiva (drawer no mobile), grids adaptativas e board com scroll horizontal.
- **Acessibilidade**: atributos `aria-label`, `aria-invalid`, labels vinculados (`htmlFor`), estados focáveis.

---

## Backend

- **Framework**: NestJS 11 (Express).
- **Organização**: módulos por domínio; `common/` (transversal), `infra/` (infraestrutura), `domain/` (regras puras).
- **Controllers/Routes**: REST (`/leads`, `/deals`, `/sellers`, `/comments`, `/dashboard`, `/users`, `/health`, `/auth`).
- **Services/use cases**: `*.service.ts` implementam a lógica de aplicação.
- **DTOs/schemas**: schemas Zod compartilhados em `@kikos/shared`, envolvidos em DTOs via `createZodDto`.
- **Validação**: `ZodValidationPipe` global (`nestjs-zod`).
- **Tratamento de erros**: `HttpExceptionFilter` global + `ResponseInterceptor` (formato padronizado `{ success, data, code, timestamp, path }`).
- **Autenticação**: Better Auth (guard global `AuthGuard`), sessão via cookie.
- **Autorização**: papel (`admin`/`seller`) + checagem de propriedade do recurso via utilitários puros.
- **Middlewares**: helmet, CORS, throttler, logging (pino), `trust proxy`.
- **Banco de dados**: Prisma com PostgreSQL.
- **Migrations/Seed**: Prisma migrations + `prisma/seed.ts`.
- **Logging**: `nestjs-pino` + `LoggerService`.
- **Health check**: `GET /health` (anônimo).
- **Documentação**: Swagger + Scalar em `/docs`.

---

## Banco de dados

**SGBD**: PostgreSQL. **ORM**: Prisma 7 (com driver adaptado `@prisma/adapter-pg`).

### Entidades e relacionamentos

```
User 1───* Session
User 1───* Account
User 1───* Lead   (como "seller")
User 1───* Deal   (como "seller")
User 1───* Comment (autor)
User 1───* Activity
Lead 1───* Deal
Lead 1───* Comment
Deal 1───* Comment
Deal/Lead 1───* Activity
```

| Entidade | Papel | Campos principais |
| -------- | ----- | ----------------- |
| **User** | Usuário do sistema (`admin` ou `seller`) | `name`, `email` (único), `password?`, `role`, `emailVerified`, `picture` |
| **Session** | Sessão do Better Auth | `token` (único), `expiresAt`, `ipAddress`, `userAgent`, `userId` |
| **Account** | Credenciais do Better Auth | `providerId`, `accountId`, `password` (hash), `userId` |
| **Lead** | Contato/oportunidade | `name`, `email?`, `phone?`, `company?`, `source?`, `notes?`, `status`, `sellerId` |
| **Deal** | Negócio vinculado a um lead | `name`, `value` (Decimal), `status`, `description?`, `leadId`, `sellerId` |
| **Comment** | Comentário em lead e/ou negócio | `content`, `authorId`, `leadId?`, `dealId?` |
| **Activity** | Histórico/feed de eventos | `type`, `metadata` (JSON), `leadId?`, `dealId?`, `userId?` |

### Enums

- **UserRole**: `admin`, `seller`
- **LeadStatus**: `new`, `contacted`, `qualified`, `converted`, `lost`
- **DealStatus**: `new`, `in_progress`, `won`, `lost`
- **ActivityType**: `LEAD_CREATED`, `LEAD_UPDATED`, `DEAL_CREATED`, `DEAL_UPDATED`, `DEAL_STATUS_CHANGED`, `COMMENT_CREATED`, `DEAL_WON`, `DEAL_LOST`

### Regra de domínio — transição de status do negócio

A orquestração de status é **modelada como uma máquina de estados** em `apps/api/src/domain/deals/deal-status.transition.ts`:

```
new ────────▶ in_progress ────────▶ won | lost
new ────────▶ won | lost  (NÃO permitido)
won / lost ──── qualquer outro (NÃO permitido — estado terminal)
```

Transição para o mesmo status é permitida (idempotente). A regra é validada **no servidor** (service) e **no cliente** (Kanban).

---

## Autenticação

- **Biblioteca**: Better Auth (`better-auth`) integrada ao NestJS via `@thallesp/nestjs-better-auth`.
- **Método**: email/senha, com hash de senha via **bcrypt** (10 rounds).
- **Sessão**: baseada em cookie (incluindo cookie entre subdomínios em produção), com rastreamento de IP (`x-client-ip` / `x-forwarded-for`).
- **Guard global**: `AuthGuard` aplicado a todas as rotas; endpoints públicos (ex.: `/health`) usam `@AllowAnonymous()`.
- **Frontend**: `authClient` (better-auth) para login/logout; `middleware.ts` redireciona não autenticados e valida papéis por rota.
- **Modelo de dados**: `User`, `Session`, `Account`, `Verification` seguem o contrato do Better Auth.

---

## Validação e tratamento de erros

### Validação
- Schemas **Zod** centralizados em `@kikos/shared` (fonte única) e reutilizados no backend (`ZodValidationPipe`) e no frontend (react-hook-form).
- Tipos de API derivados dos schemas com `z.infer`.

### Tratamento de erros
- **Backend**: `HttpExceptionFilter` (global) normaliza respostas de erro em `{ timestamp, path, message, code }`, com mapeamento de mensagens em português via `formatErrorMessage(Codes)`.
- **ResponseInterceptor**: padroniza respostas de sucesso `{ success, data, code, path, timestamp }`.
- **Códigos de erro** centralizados no enum `Codes` do pacote compartilhado.
- **Frontend**: os tRPC routers extraem a mensagem de erro do Axios e a propagam; componentes exibem `ErrorState` com retry.

---

## TypeScript

O projeto usa TypeScript de forma idiomática e tipa a integração frontend/backend de forma centralizada.

- **Schemas como fonte de verdade**: DTOs, tipos de request/response e tipagens de query são derivados de schemas Zod (`z.infer`) em `@kikos/shared`.
- **Tipos compartilhados**: `HttpResponse<T>`, `PaginatedResult<T>`, `DealDto`, `LeadDto`, `SellerDto`, `CommentDto`, `DashboardDto`, etc.
- **Enums compartilhados**: `UserRole`, `LeadStatus`, `DealStatus`, `ActivityType`.
- **Strict mode**: no frontend (`strict: true`, `noUncheckedIndexedAccess: true`). No backend o `tsconfig` usa `strict: false` (ver "Trade-offs").
- **Generics/utility types**: uso em paginação (`PaginatedResult<T>`), serialização e mappers.
- **Type guards**: `isAdmin(role)` e helpers de autorização em `authorization.util.ts`.

### Pontos de melhoria
- `any` em pontos isolados (ex.: `error.cause` no middleware, `metadata` JSON no dashboard).
- `strict: false` no `apps/api/tsconfig.json` — recomendado migrar para stricto.
- Validação de rotas de tRPC parcialmente duplicada com os schemas compartilhados.

---

## Programação funcional

O desafio menciona **Effect-TS** e **fp-ts** como diferenciais. **Nenhuma dessas bibliotecas é utilizada no projeto** (não há dependência nem uso em código-fonte).

O projeto adota, no entanto, algumas práticas alinhadas ao estilo funcional, de forma **localizada e honesta**:

- **Funções puras no domínio**: `canTransitionDealStatus` e `getTransitionErrorMessage` em `apps/api/src/domain/deals/` são puras e testáveis.
- **Imutabilidade**: updater functions no estado do Kanban (ex.: `prev.map(...)`).
- **Composição/helpers puros**: utilitários de autorização e paginação (`isAdmin`, `assertSellerAccess`, `buildPaginatedResult`, `parseSortParam`).
- **Tratamento explícito de erros**: padrão de "throw" tipado com códigos, em vez de resultados `Result`/`Either`.

A maior parte da aplicação segue o estilo **orientado a objetos/injetável** do NestJS (classes, providers, DI). A transição para Effect-TS/fp-ts exigiria uma reescrita significativa da camada de domínio e de infraestrutura, e está documentada como melhoria futura.

---

## Design e UX

A interface implementa uma adaptação funcional do conceito de CRM:

- **Layout**: sidebar fixa (drawer no mobile), header com título/descrição e ações, conteúdo responsivo.
- **Kanban**: board com uma coluna por status, cards com avatar do lead/vendedor, valor formatado como moeda, drag & drop com feedback visual (overlay, highlight da coluna alvo, indicador de transição inválida).
- **Cards**: nome, valor (BRL compacto), lead e vendedor associados.
- **Formulários**: `FieldSet`/`Field`/`FieldLabel`/`FieldError` com validação instantânea (Zod + RHF).
- **Feedback**: toasts de sucesso/erro, skeletons de carregamento, `EmptyState` e `ErrorState` com ação de retry.
- **Drawers**: detalhes de lead e negócio em painel lateral, com histórico de comentários.
- **Consistência**: design system em `@kikos/ui` (badges, botões, inputs, selects, avatares, skeletons, spinner).
- **Estados**: loading (skeleton), empty (nenhum dado), error (fetch falhou), pending (mutações).
- **Responsividade**: grids adaptam de 1 a 4 colunas; board com scroll horizontal; tabela de leads com scroll.

---

## Testes

### O que existe
- **Unit test** (Jest): `apps/api/src/domain/deals/deal-status.transition.spec.ts` — cobre todas as transições permitidas e negadas da máquina de estados.
- **E2E** (supertest): `apps/api/test/app.e2e-spec.ts` — apenas o bootstrap do app (`GET /` retorna 200 "Hello World!"), sem cobertura das rotas do CRM.

### Como executar
```sh
# No diretório do backend
cd apps/api

# Unit tests
pnpm test

# E2E
pnpm test:e2e

# Cobertura
pnpm test:cov
```

### Cobertura
- **Coberta**: regra de transição de status do negócio (domínio puro).
- **Não coberta**: services, controllers, autenticação, autorização, comentários, dashboard, e fluxos de frontend (componentes, formulários, Kanban).

### Lacunas
- Integração/unit tests para os services de leads, deals, sellers, comments e dashboard.
- Testes de autorização (admin vs. seller).
- Testes de componentes e E2E do frontend.
- Testes das rotas REST (além do bootstrap).

---

## Infraestrutura

### Docker
- **`docker/api.Dockerfile`**: multi-stage (pruner → install → build → runner) com `turbo prune`, build do NestJS e runtime com `postgresql-client`.
- **`docker/web.Dockerfile`**: multi-stage com build do Next.js (`output: standalone`) e runtime.
- **`apps/api/docker-compose.yml`**: orquestra **PostgreSQL 17**, **PgBouncer** (pooling transaction) e **Redis 7** para desenvolvimento local.

### Kubernetes (`infra/k8s`)
- **Namespace**: `kikos`.
- **API**: `deployment` (2 réplicas, probe `/health`), `service` (ClusterIP), `configmap`, `secret` (template), `prisma-migrate-job`.
- **Web**: `deployment` (2 réplicas), `service`, `configmap`, `secret` (template).
- **Database**: `deployment` (PostgreSQL 17) + `pvc` + `secret` (template).
- **Gateway API (Traefik)**: `gatewayclass`, `gateway` (HTTP/HTTPS, TLS terminate), `httproute` para `api.*` e `app.*`.
- **cert-manager**: `clusterissuer` (Let's Encrypt production) + `certificate` para os domínios.

### Observabilidade
- Health check em `GET /health` (readiness probe do Deployment).
- Logging estruturado via `nestjs-pino`.

---

## CI/CD

O fluxo de deploy é automatizado em `.github/workflows/deploy.yml`, disparado no push para `main`:

```text
Git Push (main)
   ↓
GitHub Actions
   ↓
Build + Push imagens (API & Web) → GHCR (ghcr.io/ilannildo)
   ↓
Set Kubernetes context (kubeconfig)
   ↓
Aplicar namespace + configs
   ↓
Aplicar Deployments/Services
   ↓
Job de migration Prisma (kubectl apply + wait)
   ↓
Atualizar imagem (kubectl set image)
   ↓
Wait rollout API & Web
   ↓
Aplicar Gateway API (Traefik) + HTTPRoutes
   ↓
Aplicar cert-manager (ClusterIssuer + Certificate) e aguardar TLS
```

- **Registry**: GitHub Container Registry (`ghcr.io`), com tags `sha-<short>` + `latest`.
- **Cache de build**: `type=gha` (Buildx cache).
- **Concorrência**: grupo `deploy-kikos-crm` com `cancel-in-progress`.
- **Secrets**: `KUBECONFIG`, `GITHUB_TOKEN`. Segredos de aplicação ficam em Secrets do Kubernetes (templates em `infra/k8s/*/secret.example.yaml`).

---

## Variáveis de ambiente

### Backend (`apps/api`)
```
DATABASE_URL
DATABASE_HOST
DATABASE_PORT
DATABASE_USER
DATABASE_PASS
DATABASE_NAME
NODE_ENV            # development | test | production
PORT
APP_NAME
APP_BASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
```

### Frontend (`apps/web`)
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_URL
```

### Infraestrutura (Kubernetes)
- `KUBECONFIG` (GitHub Actions)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (Postgres)
- Templates de Secret em `infra/k8s/{api,web,database}/postgres/*/secret.example.yaml`

> Nenhum valor real de secret é exposto no repositório. Os segredos são provisionados via Kubernetes Secrets (manifestos de exemplo com placeholders).

---

## Como executar localmente

### Pré-requisitos
- Node.js v25.4.0 (ver `.nvmrc`)
- pnpm 10+ (`corepack enable`)
- PostgreSQL (ou use o `docker-compose` abaixo)
- Docker (opcional, para o banco)

### Instalação

```sh
# Instalar dependências do monorepo
pnpm install
```

### Banco de dados

A forma mais rápida é subir o stack de banco local via Docker Compose:

```sh
cd apps/api
# crie o .env com as variáveis necessárias (DATABASE_URL, DATABASE_HOST, etc.)
docker compose up -d
```

### Migrations

As tarefas `db:migrate`/`db:deploy` estão definidas no `turbo.json`, mas devem ser executadas no diretório do backend:

```sh
cd apps/api
pnpm prisma migrate dev
```

Em produção, a migração é executada via Job de Kubernetes (`prisma migrate deploy`).

### Seed

```sh
cd apps/api
pnpm prisma db seed
```

O seed cria usuários de exemplo:
- Admin: `admin@kikosfitness.com.br`
- Vendedores: `carlos@`, `mariana@`, `rafael@`, `juliana@` (todos `@kikosfitness.com.br`)
- **Senha padrão de todos: `12345678`**

Também cria leads, negócios, comentários e atividades de demonstração.

> **Importante**: o seed segue o mesmo esquema de hash do Better Auth (senha armazenada em `Account`), mantendo compatibilidade com o login.

### Desenvolvimento

```sh
# Na raiz — roda API e Web em paralelo
pnpm dev
```

- **Web**: `http://localhost:3000` (porta padrão do Next.js)
- **API**: porta definida por `PORT` no `.env` do backend (padrão `3000`; em produção o container usa `8082`)

> Ajuste `NEXT_PUBLIC_API_URL` no `.env` do web para apontar para a API em desenvolvimento.

### Build

```sh
pnpm build
```

### Produção

```sh
# Backend (build NestJS)
cd apps/api && pnpm start:prod

# Web (build Next.js)
cd apps/web && pnpm start
```

---

## Deploy

O deploy é orientado a Kubernetes e automatizado via GitHub Actions (ver seção [CI/CD](#cicd)). O fluxo de produção contempla:

1. Build de imagens Docker para API e Web.
2. Push para GHCR.
3. Aplicação de manifests Kubernetes (namespace, deployments, services, configmaps, secrets).
4. Execução de migração Prisma via Job.
5. Rollout dos Deployments.
6. Configuração de Gateway (Traefik) e TLS (cert-manager/Let's Encrypt).

Os domínios de produção estão configurados nos manifests/CI como `api.kikos.ilannildo.com.br` / `app.kikos.ilannildo.com.br` (dev/referência) e `api/app.kikos.teragestor.com.br` (produção). **Os valores reais de produção (URLs ativas, secrets) não são verificáveis a partir do código** e devem ser confirmados no cluster.

---

## Decisões técnicas

- **Monorepo (pnpm + Turborepo)**: centraliza dependências, compartilha configs (ESLint, TS) e permite que o `packages/shared` seja a fonte única de contratos entre frontend e backend, reduzindo drift de tipos.
- **NestJS no backend**: estrutura modular, DI, decorators e ecossistema maduro para construção de APIs REST com separação clara de responsabilidades.
- **Next.js + React no frontend**: SSR/App Router, rotas protegidas via middleware e integração natural com a camada BFF (tRPC).
- **tRPC como BFF**: tipa as chamadas entre o frontend e a camada de services, mantendo o backend como API REST independente.
- **Prisma + PostgreSQL**: schema declarativo, migrations versionadas e tipagem forte das entidades. Adoção do driver `@prisma/adapter-pg` para gerenciamento de conexão.
- **Zod como fonte de verdade**: validação de entrada e tipos derivados compartilhados entre backend e frontend.
- **Better Auth**: autenticação com sessão por cookie, hashing de senha (bcrypt) e modelo de dados padronizado, com guard global no NestJS.
- **Domínio puro**: regras de transição de status isoladas em funções puras, testáveis e independentes do framework — decisão alinhada ao princípio de "domain logic first".
- **Autorização por papel + propriedade**: utilitários puros (`isAdmin`, `assertSellerAccess`) garantem que vendedores acessem apenas seus dados.
- **Infra declarativa**: Kubernetes + Gateway API (Traefik) + cert-manager, versionada no repositório, permitindo deploy reproduzível e automação via CI/CD.

---

## Trade-offs

- **`strict: false` no backend**: o `apps/api/tsconfig.json` não adota TypeScript strict. A tipagem compartilhada mitiga parte dos riscos, mas há espaço para endurecer o compilador.
- **tRPC duplicando validação**: os routers tRPC repetem parte das validações já presentes nos schemas compartilhados, gerando alguma duplicação.
- **Sem Effect-TS/fp-ts**: a programação funcional é parcial (domínio puro), sem adoção das bibliotecas citadas no desafio. Tratamento de erros usa exceptions tipadas, não `Result`/`Either`.
- **Sem integração de IA**: não há funcionalidade de IA implementada.
- **Testes limitados**: a cobertura atual é mínima (domínio + bootstrap e2e); não há testes de services, controllers, autorização ou frontend.
- **BullMQ/Redis como dependência**: presentes no `package.json` e no `docker-compose`, mas sem filas/consumidores efetivos no código de domínio.
- **Estado do Kanban**: uses optimistic update local com rollback em erro — boa UX, mas a fonte de verdade é o servidor.

---

## Melhorias futuras

- **Testes**: unit tests para services/controllers, testes de autorização (admin vs. seller) e testes de componentes/E2E no frontend.
- **TypeScript strict no backend**: habilitar `strict` e eliminar `any`.
- **Integração com IA**: sugerir próximo passo de lead/negócio, resumir conversas ou classificar leads (ex.: OpenAI/Anthropic/Vercel AI SDK).
- **Adoção de Effect-TS/fp-ts**: reescrever a camada de domínio e parte da infra com `Effect` (pipeline, error handling, effects) para explorar o diferencial do desafio.
- **Filas (BullMQ)**: aproveitar o Redis/Queue já provisionado para processamento assíncrono (e-mails, notificações, IA).
- **Observabilidade**: adicionar métricas (Prometheus), tracing e alertas.
- **Refresh/refresh token + renew de sessão**: robustecer o ciclo de vida da sessão.
- **Soft delete / auditoria**: para leads e negócios.
- **Testes de integração ponta a ponta** cobrindo o fluxo completo Login → Lead → Negócio → Kanban → Ganho/Perdido.

---

## Checklist de requisitos

| Área           | Cobertura | Observação |
| -------------- | --------- | ---------- |
| Autenticação   | ✅ Implementado | Login/logout, sessão por cookie, registro, guard global e middleware de rotas. |
| Leads          | ✅ Implementado | CRUD, busca, filtros, paginação, detalhes e comentários. |
| Negócios       | ✅ Implementado | CRUD, valor, vínculo a lead/vendedor, mudança de status, ganho/perdido. |
| Vendedores     | ✅ Implementado | Listagem com métricas (pipeline, ganho, perdido) e criação (admin). |
| Kanban         | ✅ Implementado | Board com colunas por status, drag & drop, transição validada no cliente e servidor. |
| Comentários    | ✅ Implementado | Comentários em leads e negócios, com histórico e autorização de exclusão. |
| Dashboard      | ✅ Implementado | KPIs, pipeline por status, negócios e atividades recentes. |
| IA             | ❌ Não implementado | Sem integração com provedores de IA. |
| Programação funcional | 🟡 Parcial | Funções puras no domínio; sem Effect-TS/fp-ts. |
| Testes         | 🟡 Parcial | Unit test de transição de status + bootstrap e2e; sem cobertura ampla. |
| Infraestrutura | ✅ Configurada | Docker, Kubernetes, Traefik Gateway, cert-manager, PostgreSQL. |
| CI/CD          | ✅ Implementado | GitHub Actions: build, push GHCR, deploy k8s, migração Prisma, TLS. |
