# @org/api

A NestJS API built with **Domain-Driven Design** and **Clean Architecture**, applied to an ISO 20022 SEPA payment processing domain.

The project serves as a reference implementation showing how DDD tactical patterns (Aggregates, Value Objects, Domain Events) and Clean Architecture layers (Domain, Application, Infrastructure, Presentation) work together in a TypeScript / NestJS stack with Prisma, Fastify, and Auth0.

---

## Table of contents

- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Documentation](#documentation)

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (see `package.json` engines)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for the PostgreSQL database)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start the PostgreSQL database
pnpm run docker:up

# 3. Create the .env file from the example
pnpm run setup:local:env

# 4. Generate the Prisma client
pnpm run prisma:generate

# 5. Run database migrations
pnpm run prisma:migrate

# 6. Start the dev server (watch mode)
pnpm run dev
```

The API runs on `http://localhost:3000` by default.

### Environment variables

| Variable          | Description                  | Default (local)                                      |
| ----------------- | ---------------------------- | ---------------------------------------------------- |
| `NODE_ENV`        | Environment mode             | `local`                                              |
| `PORT`            | HTTP server port             | `3000`                                               |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://admin:password@localhost:5432/postgres` |
| `AUTH0_ISSUER_URL`| Auth0 tenant URL             | *(required in production)*                           |
| `AUTH0_AUDIENCE`  | Auth0 API audience           | *(required in production)*                           |

---

## Scripts

| Script                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| `pnpm run dev`           | Start the dev server with watch mode          |
| `pnpm run build`         | Build the project                             |
| `pnpm run start`         | Start the built project                       |
| `pnpm run test`          | Run all tests with coverage                   |
| `pnpm run tsc`           | Type-check without emitting                   |
| `pnpm run check:fix`     | Lint and format with Biome                    |
| `pnpm run docker:up`     | Start the PostgreSQL container                |
| `pnpm run prisma:generate` | Generate the Prisma client                  |
| `pnpm run prisma:migrate`  | Run database migrations                     |
| `pnpm run prisma:studio`   | Open the Prisma Studio GUI                  |
| `pnpm run prisma:reset`    | Reset the database (drop + re-migrate)      |
| `pnpm run openapi:export`  | Export the OpenAPI specification             |

---

## Tech stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Runtime        | Node.js + TypeScript 5.9             |
| Framework      | NestJS 11 + Fastify                  |
| Database       | PostgreSQL 17 + Prisma 7             |
| Authentication | Auth0 (passport-jwt + jwks-rsa)      |
| Validation     | class-validator + class-transformer  |
| API docs       | Swagger (nestjs/swagger) + Scalar    |
| Testing        | Vitest + @vitest/coverage-v8         |
| Linting        | Biome 2.4                            |
| Package manager| pnpm                                 |

---

## Project structure

```
src/
├── libs/                        # Shared kernel
│   ├── decorators/              #   @CurrentUser(), @Public()
│   ├── errors/                  #   Layered error classes (Domain, Application, Infrastructure, Presentation)
│   └── value-objects/           #   Uuid, Email
│
├── modules-business/            # Bounded contexts
│   ├── payment/                 #   SEPA payment processing
│   │   └── domain/              #     Aggregates, Entities, Value Objects, Events, Enums
│   └── user/                    #   User identity management
│       ├── domain/              #     User aggregate, Auth0Id VO, Repository interface
│       ├── application/         #     GetOrCreateUserUseCase
│       ├── infrastructure/      #     Prisma repository, DI tokens/providers
│       └── presentation/        #     Controller, DTO, Module
│
└── modules-root/                # Cross-cutting modules
    ├── app/                     #   Bootstrap, JWT guard/strategy, filters, interceptors, pipes
    ├── database/                #   PrismaService, Unit of Work
    └── env/                     #   Environment validation
```

---

## Documentation

| Document | Description |
| -------- | ----------- |
| [Domain-Driven Design](./documentations/README_DDD.md) | DDD concepts (Aggregates, Value Objects, Domain Events, Repositories) and how they are implemented in this repo. Benefits and drawbacks. |
| [Clean Architecture](./documentations/README_CLEAN_ARCHI.md) | The four layers (Domain, Application, Infrastructure, Presentation), the Dependency Rule, data flow across boundaries, cross-cutting concerns. Benefits and drawbacks. |
| [Code Conventions](./documentations/README_CONVENTION.md) | TypeScript style guide based on the Google TypeScript Style Guide, adapted for the NestJS / Biome stack. Naming, imports, classes, types, formatting rules. |
| [Database Schema](./documentations/README_DATABASE_GRAPH.md) | Entity-Relationship diagram of the PostgreSQL database (Mermaid). |
