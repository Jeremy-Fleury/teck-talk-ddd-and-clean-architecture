# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm run build            # Build (nest build)
pnpm run dev              # Dev server with watch (nest start --watch)
pnpm run test             # Run all tests (vitest run, with coverage)
pnpm run tsc              # Type-check without emit
pnpm run check:fix        # Lint + format (biome check --write)
pnpm run prisma:generate  # Generate Prisma client (uses fake DB URL)
pnpm run prisma:migrate   # Run Prisma migrations
```

Run a single test file: `pnpm test run src/modules-business/payment/domain/value-objects/money.vo.spec.ts`

## Architecture

NestJS API using **Domain-Driven Design** with **Clean Architecture** layers. ISO 20022 payment processing domain.

### Source layout

```
src/
  libs/                          # Shared kernel (value objects, errors, decorators)
  modules-business/              # Business modules (payment, user)
    <module>/
      domain/                    # Pure business logic, no framework deps
        aggregates/              # Aggregate roots (state machines, invariant enforcement)
        entities/                # Child entities owned by aggregates
        value-objects/           # Immutable, self-validating VOs
        enums/                   # Domain enums
        events/                  # Domain events
        repositories/            # Repository interfaces (ports)
      application/               # Use cases / application services
      infrastructure/            # Prisma repositories, DI providers/tokens
      presentation/              # NestJS controllers, DTOs, modules
  modules-root/                  # Cross-cutting: app setup, database, env config
```

### Key patterns

**Value Objects** — private constructor, `static create()` for new instances with validation, `static fromPrimitives()` for hydration, `toPrimitives()` for serialization, `equals()` for comparison.

**Aggregates** — private constructor, `static create()` emits domain events, `static fromPrimitives()` for reconstitution. Mutable state (e.g. `_status`) changes only through behavior methods that enforce invariants. Private `_domainEvents` array tracks state transitions.

**Repository pattern** — interface in `domain/repositories/`, implementation in `infrastructure/repositories/` using Prisma. Injected via NestJS DI with Symbol tokens defined in `infrastructure/dependency-injection/tokens/`.

**Unit of Work** — `UnitOfWorkPrismaService.execute()` wraps multi-entity operations in a Prisma transaction.

**Error hierarchy** — `DomainError` (`ValidationDomainError`, `InvalidTransitionDomainError`), `ApplicationError`, `InfrastructureError`, `PresentationError`. Each carries a `payload: Record<string, unknown>`.

**Serialization** — Domain objects expose `toPrimitives()`. Presentation DTOs use `@Expose()` + `@ApiProperty()`. `StrictSerializerInterceptor` validates output conformance.

### DI wiring (per module)

```
tokens/<name>.token.ts     → export const TOKEN = Symbol('...')
providers/<name>.provider.ts → Provider factory using useFactory + inject
<module>.module.ts          → @Module({ providers: [...], exports: [TOKEN] })
```

## Coding conventions

See `readme-convention.md` for the full style guide. Key points:

- **Package manager**: pnpm
- **Formatter/linter**: Biome — tabs, 180 char line width, single quotes, trailing commas, semicolons
- **Named exports only** — no default exports (enforced by Biome)
- **`import type`** for type-only imports
- **No barrel files** (`index.ts` re-exports) — import directly from source files
- **Private members prefixed with `_`** (enforced by Biome naming convention)
- **`readonly` on all non-reassigned properties**
- **Section comments** use the pattern: `// ─── Section Name ──────────────────────`
- **Import order** (auto-sorted by Biome): packages → node → `@/modules-root` → `@/modules-business` → `@/libs` → relative
- **Path aliases**: `@/*` → `src/*`, `@/tests/*` → `tests/*`
- **No `any`** — use `unknown` (enforced by Biome)
- **Tests**: colocated `*.spec.ts` files, Vitest with globals (describe/it/expect), coverage on `domain/**` and `application/**`
- **Database**: PostgreSQL + Prisma, schema in `prisma/schema/`
- **Language**: code in English, documentation/comments may be in English
