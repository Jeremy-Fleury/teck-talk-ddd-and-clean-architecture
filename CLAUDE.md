# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm run build            # Build (nest build)
pnpm run start            # Start the built project
pnpm run dev              # Dev server with watch (nest start --watch)
pnpm run test             # Run all tests (vitest run, with coverage)
pnpm run tsc              # Type-check without emit
pnpm run check:fix        # Lint + format (biome check --write)
pnpm run docker:up        # Start PostgreSQL container
pnpm run prisma:generate  # Generate Prisma client (uses fake DB URL)
pnpm run prisma:migrate   # Run Prisma migrations
pnpm run prisma:studio    # Open Prisma Studio GUI
pnpm run prisma:reset     # Reset database (drop + re-migrate)
pnpm run openapi:export   # Export OpenAPI specification
```

Run a single test file: `pnpm test run src/modules-business/payment/domain/value-objects/money.vo.spec.ts`

## Tech stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Runtime         | Node.js + TypeScript 5.9            |
| Framework       | NestJS 11 + Fastify                 |
| Database        | PostgreSQL 17 + Prisma 7            |
| Authentication  | Auth0 (passport-jwt + jwks-rsa)     |
| Validation      | class-validator + class-transformer |
| API docs        | Swagger (nestjs/swagger) + Scalar   |
| Testing         | Vitest + @vitest/coverage-v8        |
| Linting         | Biome 2.4                           |
| Package manager | pnpm                                |

## Environment variables

| Variable           | Description                  | Default (local)                                      |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| `NODE_ENV`         | Environment mode             | `local`                                              |
| `PORT`             | HTTP server port             | `3000`                                               |
| `DATABASE_URL`     | PostgreSQL connection string | `postgresql://admin:password@localhost:5432/postgres` |
| `AUTH0_ISSUER_URL` | Auth0 tenant URL             | *(required in production)*                           |
| `AUTH0_AUDIENCE`   | Auth0 API audience           | *(required in production)*                           |

---

## Architecture

NestJS API using **Domain-Driven Design** with **Clean Architecture** layers. ISO 20022 SEPA payment processing domain. Reference implementation showing how DDD tactical patterns and Clean Architecture layers work together.

### Source layout

```
src/
  libs/                          # Shared kernel
    decorators/                  #   @CurrentUser(), @Public(), @Serialize()
    errors/                      #   Layered error classes (Domain, Application, Infrastructure, Presentation)
    value-objects/               #   Uuid, Email
  modules-business/              # Bounded contexts
    payment/                     #   SEPA payment processing (ISO 20022)
      domain/                    #     Aggregates, Entities, Value Objects, Events, Enums
    user/                        #   User identity management (Auth0)
      domain/                    #     User aggregate, Auth0Id VO, Repository interface
      application/               #     GetOrCreateUserUseCase
      infrastructure/            #     Prisma repository, DI tokens/providers
      presentation/              #     Controller, DTO, Module
  modules-root/                  # Cross-cutting modules
    app/                         #   Bootstrap, JWT guard/strategy, filters, interceptors, pipes
    database/                    #   PrismaService, Unit of Work
    env/                         #   Environment validation
```

### Bounded Contexts

Two bounded contexts exist with separate models:
- **payment/** — SEPA payment processing. Speaks ISO 20022: `CreditTransfer`, `Party`, `ControlSum`, `ServiceLevel`, `EndToEndId`
- **user/** — User identity management. Has `Auth0Id`, `Email`, name fields

The same person is a `User` (with Auth0Id) in the user context and a `Party` (with IBAN, BIC, country) in the payment context. These are deliberately separate models.

---

## Clean Architecture — The Dependency Rule

Source code dependencies must point inward only. An inner layer must never import or know about an outer layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRESENTATION          (outermost)                                   │
│  NestJS controllers, DTOs, guards, interceptors, pipes, modules      │
│  Converts HTTP ↔ application calls. No business logic.               │
└─────────────────────────────────────────────────────────────────────┘
                             │ depends on ↓
┌─────────────────────────────────────────────────────────────────────┐
│  APPLICATION             (orchestrates domain objects)               │
│  Use Cases — single business operation entry point                   │
└─────────────────────────────────────────────────────────────────────┘
                             │ depends on ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN                  (innermost — depends on nothing)            │
│  Aggregates, Entities, Value Objects, Events, Repository interfaces  │
│  Pure business logic. No framework, no database, no IO.              │
└─────────────────────────────────────────────────────────────────────┘
                             ↑ implements
┌─────────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE            (implements domain interfaces)            │
│  Prisma repositories, DI tokens/providers, Unit of Work impl         │
│  Depends on domain, not the reverse.                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### File system per bounded context

```
modules-business/<module>/
├── domain/                    # Innermost: pure business logic, zero framework imports
│   ├── aggregates/            #   Aggregate roots (state machines, invariant enforcement)
│   ├── entities/              #   Child entities owned by aggregates
│   ├── value-objects/         #   Immutable, self-validating VOs
│   ├── enums/                 #   Domain enums
│   ├── events/                #   Domain events
│   └── repositories/          #   Repository interfaces (ports)
├── application/               # Use cases / application services
├── infrastructure/            # Adapters: Prisma repos, DI providers/tokens
│   ├── repositories/          #   Repository implementations
│   └── dependency-injection/
│       ├── tokens/            #   Symbol-based DI tokens
│       └── providers/         #   Factory providers
└── presentation/              # Outermost: HTTP controllers, DTOs, modules
    ├── controllers/
    ├── dto/
    │   └── outputs/
    └── modules/
```

---

## DDD Tactical Patterns

### Value Objects

Immutable, self-validating objects defined by their attributes. Two VOs with the same data are equal.

**Existing VOs:** `Money`, `Iban`, `Bic`, `Party`, `EndToEndId`, `Email`, `Auth0Id`, `Uuid`

**Required pattern:**
```ts
export class Money {
	private readonly _amount: number;
	private readonly _currency: string;

	// 1. Private constructor — cannot be called from outside
	private constructor(amount: number, currency: string) {
		this._amount = amount;
		this._currency = currency;
	}

	// 2. static create() — validates, then creates (for NEW instances)
	static create(amount: number, currency: string): Money {
		Money._validate(amount, currency);
		return new Money(amount, currency);
	}

	// 3. static fromPrimitives() — hydration from DB (no validation, no events)
	static fromPrimitives(data: MoneyPrimitives): Money {
		return new Money(data.amount, data.currency);
	}

	// 4. toPrimitives() — serialization to plain object
	toPrimitives(): MoneyPrimitives {
		return { amount: this._amount, currency: this._currency };
	}

	// 5. equals() — equality by value, not reference
	equals(other: Money): boolean {
		return this._amount === other._amount && this._currency === other._currency;
	}

	// 6. Operations return new instances (immutability)
	add(other: Money): Money {
		this._assertSameCurrency(other);
		return new Money(this._amount + other._amount, this._currency);
	}
}
```

**Key rules:**
- Private constructor forces creation through `create()` or `fromPrimitives()`
- All fields `readonly` — once created, never changes
- Self-validating — invalid state is impossible
- VOs can compose other VOs (e.g., `Party` contains `Iban` and `Bic`)

### Aggregates

Cluster of domain objects treated as a single unit. The Aggregate Root is the only entry point. It enforces business invariants spanning the whole cluster.

**Existing aggregates:** `Payment` (root) + `CreditTransfer[]` (child entities), `User`

**Required pattern:**
```ts
export class Payment {
	private readonly _id: Uuid;
	private _status: PaymentStatus;              // mutable — changes via behavior methods
	private readonly _debtor: Party;
	private readonly _creditTransfers: CreditTransfer[];
	private _domainEvents: DomainEvent[] = [];   // tracks state transitions

	private constructor(props: PaymentProps) { /* ... */ }

	// static create() — business creation: validates invariants, generates ID, emits events
	static create(input: CreatePaymentInput): Payment { /* ... */ }

	// static fromPrimitives() — hydration from DB: no validation, no events
	static fromPrimitives(data: PaymentPrimitives): Payment { /* ... */ }

	// Behavior methods enforce state transitions
	markAsCleared(clearingReference: string): void {
		this._assertStatus(PAYMENT_STATUS.initiated, 'clear');  // guard
		this._status = PAYMENT_STATUS.cleared;                   // transition
		this._domainEvents.push(new PaymentClearedEvent(/*...*/)); // event
	}
}
```

**Payment state machine:**
```
  Initiated ──→ Cleared ──→ Settled
      │             │
      └─────────────┴──→ Rejected
```

**Invariants enforced by `create()`:**
- At least one credit transfer
- Execution date not in the past
- All transfers share the same currency

**Two factory methods:**
- `create()` — business creation: validates invariants, generates ID, emits domain events
- `fromPrimitives()` — hydration from database: no validation, no events (data was already valid when saved)

### Domain Events

Immutable data carriers created during state transitions. Accumulated in `_domainEvents` array.

**Existing events:** `PaymentInitiatedEvent`, `PaymentClearedEvent`, `PaymentSettledEvent`, `PaymentRejectedEvent`

```ts
export abstract class DomainEvent {
	readonly occurredAt: Date;
	readonly paymentId: string;
	abstract readonly eventType: string;
}
```

### Repository Pattern

Interface in `domain/repositories/`, implementation in `infrastructure/repositories/` using Prisma. The domain never imports Prisma.

```ts
// Domain layer — the interface (port)
export interface UserRepository {
	create(user: User): Promise<void>;
	getByAuth0Id(auth0Id: Auth0Id): Promise<User | null>;
}

// Infrastructure layer — the Prisma implementation (adapter)
export class UserPrismaRepository implements UserRepository {
	constructor(private readonly _prisma: Prisma.TransactionClient) {}

	async getByAuth0Id(auth0Id: Auth0Id): Promise<User | null> {
		const user = await this._prisma.user.findUnique({
			where: { auth0Id: auth0Id.toString() },
		});
		if (!user) return null;
		return User.fromPrimitives(user);    // DB row → domain aggregate
	}

	async create(user: User): Promise<void> {
		const primitives = user.toPrimitives();
		await this._prisma.user.create({ data: { /* ... */ } });
	}
}
```

### Use Cases (Application Services)

Orchestrate domain objects for a single business scenario. Entry point from outside world into domain.

**Rules:**
1. Receives **primitive inputs** (strings, numbers) — not domain objects, not HTTP requests
2. Creates/retrieves **domain objects** via repositories
3. Calls **behavior methods** on domain objects (use case never contains business rules itself)
4. Wraps operations in a **transaction** via Unit of Work
5. Returns **domain objects** to the caller

```ts
export class GetOrCreateUserUseCase {
	constructor(private readonly _unitOfWork: UnitOfWorkService) {}

	async execute(auth0Id: string): Promise<User> {
		return await this._unitOfWork.execute(async (context): Promise<User> => {
			let user = await context.user.getByAuth0Id(Auth0Id.create(auth0Id));
			if (user !== null) return user;

			user = User.create({ auth0Id, email: null, firstName: null, lastName: null });
			await context.user.create(user);
			return user;
		});
	}
}
```

### Unit of Work

Wraps multi-entity operations in a single Prisma transaction. All repos share the same transaction client.

```ts
// Abstract interface (domain layer)
export abstract class UnitOfWorkService {
	abstract execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T>;
}

// Prisma implementation (infrastructure layer)
export class UnitOfWorkPrismaService implements UnitOfWorkService {
	execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T> {
		return this._prismaService.$transaction((tx: Prisma.TransactionClient) => {
			const user = new UserPrismaRepository(tx);
			const context: UnitOfWorkContextService = { user };
			return callback(context);
		});
	}
}
```

---

## DI Wiring (per module)

```
infrastructure/dependency-injection/
  tokens/<name>.token.ts      → export const TOKEN = Symbol('...')
  providers/<name>.provider.ts → Provider factory using useFactory + inject
presentation/modules/
  <module>.module.ts           → @Module({ providers: [...], exports: [TOKEN] })
```

**Pattern:**
```ts
// Token — unique symbol identifier
export const GET_OR_CREATE_USER_USE_CASE_TOKEN = Symbol('GET_OR_CREATE_USER_USE_CASE_TOKEN');

// Provider — factory that NestJS calls at bootstrap
export const GET_OR_CREATE_USER_USE_CASE_PROVIDER: Provider<GetOrCreateUserUseCase> = {
	inject: [PRISMA_UNIT_OF_WORK_TOKEN],
	provide: GET_OR_CREATE_USER_USE_CASE_TOKEN,
	useFactory: (unitOfWork: UnitOfWorkService) => new GetOrCreateUserUseCase(unitOfWork),
};

// Module wiring
@Module({
	providers: [JwtStrategy, GET_OR_CREATE_USER_USE_CASE_PROVIDER],
	controllers: [UserController],
})
export class UserModule {}
```

Global providers from `DatabaseModule.forRoot()`: `PRISMA_SERVICE_PROVIDER`, `PRISMA_UNIT_OF_WORK_PROVIDER`.

---

## Error Hierarchy

Each layer has its own error classes. A global `HttpExceptionFilter` maps them to HTTP statuses. Each error carries `payload: Record<string, unknown>`.

```
Domain layer
├── ValidationDomainError               → 400 Bad Request
└── InvalidTransitionDomainError        → 409 Conflict

Application layer
├── RessourceNotFoundApplicationError   → 404 Not Found
└── RessourceAlreadyExistsApplicationError → 409 Conflict

Infrastructure layer
└── ValidationInfrastructureError       → 500 Internal Server Error

Presentation layer
├── DtoValidationPresentationError      → 400 Bad Request
└── UnauthorizedPresentationError       → 401 Unauthorized
```

The domain never imports `HttpStatus` — it only throws domain errors.

---

## Data Flow Across Layers

### Inbound: HTTP request → domain
```
HTTP request body (JSON)
  → ValidationPipe parses and validates → Input DTO (class-validator decorators)
  → Controller extracts primitives → Primitive values (strings, numbers)
  → Use case calls factory methods → Domain objects (Aggregates, Value Objects)
```

### Outbound: domain → HTTP response
```
Domain aggregate
  → .toPrimitives() → Plain object
  → StrictSerializerInterceptor applies @Serialize(OutputDto) → Output DTO (only @Expose() fields, strategy: 'excludeAll')
  → Fastify serializes → HTTP response body (JSON)
```

### Persistence: domain ↔ database
```
Domain aggregate → .toPrimitives() → Prisma .create()/.update() → Database row
Database row → Prisma query result → Aggregate.fromPrimitives() → Domain aggregate
```

---

## Cross-Cutting Concerns

### Authentication
```
JwtGuard (global) → checks @Public() metadata → if not public → JwtStrategy validates token via Auth0 JWKS
  → calls GetOrCreateUserUseCase → request.user = User aggregate → available via @CurrentUser() decorator
```

### Input validation
`ValidationPipe` (global) with `forbidNonWhitelisted: true` — unexpected properties are rejected. Applies to all incoming requests with a DTO.

### Output serialization
Every controller method **must** use the `@Serialize(OutputDto)` decorator. `StrictSerializerInterceptor` (global) enforces this. Only `@Expose()` fields reach the response. Missing the decorator throws an error.

```ts
// Output DTO example
export class UserOutputDto {
	@ApiProperty({ description: 'The user id', example: '019ad951-...' })
	@Expose()
	id!: string;

	@ApiProperty({ description: 'The user email', nullable: true })
	@Expose()
	email!: string | null;
}
```

### Error handling
`HttpExceptionFilter` (global) catches all exceptions and maps via `instanceof` to HTTP status. Produces consistent response shape: `{ status, body: { message, payload } }`.

---

## New Feature Checklist

Every feature follows this vertical slice:

1. **Domain** — Define/update aggregates, value objects, events, enums
2. **Domain** — Define repository interface in `domain/repositories/`
3. **Application** — Create use case in `application/`
4. **Infrastructure** — Implement repository in `infrastructure/repositories/`
5. **Infrastructure** — Create DI token in `infrastructure/dependency-injection/tokens/`
6. **Infrastructure** — Create DI provider in `infrastructure/dependency-injection/providers/`
7. **Presentation** — Create output DTO with `@Expose()` + `@ApiProperty()` in `presentation/dto/outputs/`
8. **Presentation** — Create controller in `presentation/controllers/`
9. **Presentation** — Wire in module in `presentation/modules/`
10. **Tests** — Colocated `*.spec.ts` files for domain and application layers

---

## Coding Conventions

Full style guide: `documentations/README_CONVENTION.md` (based on Google TypeScript Style Guide).

### Formatting (Biome — automated)

| Rule              | Value                          |
| ----------------- | ------------------------------ |
| Indentation       | Tabs (width 4)                 |
| Line width        | 180 characters                 |
| Quotes            | Single `'` (double `"` in JSX) |
| Semicolons        | Always                         |
| Trailing commas   | Everywhere                     |
| Arrow parentheses | Always `(x) => ...`            |
| Line ending       | LF                             |

Run `pnpm run check:fix` to format and auto-fix.

### Import order (auto-sorted by Biome)

1. Package type imports
2. Package imports
3. Node type imports
4. Node imports
5. `@/modules-root` type imports
6. `@/modules-root` imports
7. `@/modules-business` type imports
8. `@/modules-business` imports
9. `@/libs` type imports
10. `@/libs` imports
11. Relative imports

### Path aliases

- `@/*` → `src/*`
- `@/tests/*` → `tests/*`

### Naming conventions

| Style           | Applies to                                                           |
| --------------- | -------------------------------------------------------------------- |
| `PascalCase`    | Classes, interfaces, types, enums, type parameters                   |
| `camelCase`     | Variables, parameters, functions, methods, properties, module aliases |
| `CONSTANT_CASE` | Global constants, enum values, `static readonly`                     |
| `_camelCase`    | Private and protected class members (prefixed with `_`)              |

- Treat acronyms as whole words: `loadHttpUrl` not `loadHTTPURL`, `userId` not `userID`
- No `I` prefix on interfaces
- No Hungarian notation

### Key rules

- **Package manager**: pnpm
- **Named exports only** — no default exports (enforced by Biome)
- **`import type`** for type-only imports, **`export type`** for type re-exports
- **No barrel files** (`index.ts` re-exports) — import directly from source files
- **`readonly`** on all non-reassigned properties
- **Section comments** use the pattern: `// ─── Section Name ──────────────────────`
- **No `any`** — use `unknown` (enforced by Biome)
- **`const` by default**, `let` if necessary, never `var`
- **`interface`** over `type` for object shapes
- **`===` strict equality** (exception: `== null` for null/undefined check)
- **`function` declarations** for named top-level functions, arrow functions for callbacks
- **`private` keyword**, not `#private` fields
- Never explicit `public` (it is the default)
- **`as` syntax** for type assertions, not `<Type>` angle brackets
- **`?` optional** over `| undefined` for optional properties
- **`for...of`** to iterate arrays, never `for...in` on arrays
- **Always `{}` blocks** — even single-line if/for
- Always `throw new Error()` — never throw strings or undefined
- Empty catch blocks forbidden unless justified with comment
- Catch uses `unknown` type: `catch (e: unknown)`
- **JSDoc** for docs intended for consumers, `//` for implementation notes
- Multi-line comments use `//`, not `/* */`
- JSDoc does not redeclare TypeScript types
- JSDoc placed before decorators

### Forbidden features

`var`, `eval()`, `Function('...')`, `debugger`, `with`, `namespace`, `const enum`, `new String()`/`new Boolean()`/`new Number()`, `require()`, default exports, `#private` fields, `@ts-ignore`/`@ts-nocheck`, direct prototype manipulation, custom decorators (only framework ones).

### Tests

- Colocated `*.spec.ts` files next to source files
- Vitest with globals (`describe`, `it`, `expect` — no imports needed)
- Coverage on `src/**/domain/**/*.ts` and `src/**/application/**/*.ts`
- Domain tests: pure unit tests, no mocks, no DI, no database
- In test files: `noExplicitAny` is warn (not error), `noNonNullAssertion` is off

### Database

- PostgreSQL + Prisma
- Schema in `prisma/schema/`
- Migrations in `prisma/migrations/`

### Language

Code in English. Documentation/comments may be in English.
