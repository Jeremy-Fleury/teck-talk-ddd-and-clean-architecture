# Clean Architecture

This document explains Clean Architecture principles and how they are applied in this repository.

---

## Table of contents

01. [What is Clean Architecture?](#1-what-is-clean-architecture)
02. [The Dependency Rule](#2-the-dependency-rule)
03. [The four layers](#3-the-four-layers)
04. [Dependency Inversion in practice](#4-dependency-inversion-in-practice)
05. [Data flow across layers](#5-data-flow-across-layers)
06. [Cross-cutting concerns](#6-cross-cutting-concerns)
07. [Benefits](#7-benefits)
08. [Drawbacks](#8-drawbacks)

---

## 1. What is Clean Architecture?

Clean Architecture is a software design pattern proposed by Robert C. Martin (Uncle Bob) in 2012. Its central idea is to **organize code in concentric layers where dependencies always point inward** — from technical details toward business logic.

The goal is to make the business logic independent of:

- **Frameworks** — the domain does not know about NestJS, Express, or Fastify
- **Databases** — the domain does not know about Prisma, SQL, or MongoDB
- **External services** — the domain does not know about Auth0, SMTP, or S3
- **Delivery mechanisms** — the domain does not know about HTTP, GraphQL, or CLI

This independence means the most important part of the system (the business rules) is the most stable. Everything else can change without touching the core.

---

## 2. The Dependency Rule

The fundamental rule of Clean Architecture: **source code dependencies must point inward only**. An inner layer must never import, reference, or know about an outer layer.

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTATION          (outermost — depends on all inner layers)     │
│  Controllers, DTOs, Guards, Interceptors, Pipes, Modules             │
└──────────────────────────────────────────────────────────────────────┘
                              │ depends on ↓
┌──────────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE          (implements interfaces defined by inner)    │
│  Repository implementations, ORM, External service clients           │
└──────────────────────────────────────────────────────────────────────┘
                              │ depends on ↓
┌──────────────────────────────────────────────────────────────────────┐
│  APPLICATION             (orchestrates domain objects)               │
│  Use Cases                                                           │
└──────────────────────────────────────────────────────────────────────┘
                              │ depends on ↓
┌──────────────────────────────────────────────────────────────────────┐
│  DOMAIN                  (innermost — depends on nothing)            │
│  Aggregates, Entities, Value Objects, Events, Repository interfaces  │
└──────────────────────────────────────────────────────────────────────┘
```

In the file system, each bounded context mirrors this structure:

```
modules-business/user/
├── domain/                 ← innermost: pure business logic
├── application/            ← orchestration: use cases
├── infrastructure/         ← adapters: Prisma, providers
└── presentation/           ← outermost: HTTP controllers, DTOs
```

---

## 3. The four layers

### Domain layer — the core

The domain layer contains business rules and nothing else. It has **zero imports from frameworks, databases, or external libraries** (except standard TypeScript / utility libraries for validation like `uuid` or `validator`).

**What lives here:**

| Concept              | Role                                          | Example in this repo                         |
| -------------------- | --------------------------------------------- | -------------------------------------------- |
| Aggregates           | Business object clusters with invariants      | `Payment`, `User`                            |
| Entities             | Objects with identity, owned by aggregates    | `CreditTransfer`                             |
| Value Objects        | Immutable objects defined by their attributes | `Money`, `Iban`, `Bic`, `Party`, `Email`     |
| Domain Events        | Records of meaningful state transitions       | `PaymentInitiatedEvent`, `PaymentRejectedEvent` |
| Repository interfaces | Contracts for persistence (ports)            | `UserRepository`                             |
| Domain Errors        | Business rule violation types                 | `ValidationDomainError`, `InvalidTransitionDomainError` |

**Key constraint:** the domain layer defines interfaces for what it needs (repositories, services), but never provides implementations. It declares "I need to save a User" without knowing how that happens.

```ts
// domain/repositories/user.repository.ts — pure interface, no Prisma
export interface UserRepository {
  create(user: User): Promise<void>;
  getByAuth0Id(auth0Id: Auth0Id): Promise<User | null>;
}
```

The abstract `UnitOfWorkService` follows the same principle — defined in the domain layer, implemented elsewhere:

```ts
// database/domain/services/unit-of-work.service.ts
export abstract class UnitOfWorkService {
  abstract execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T>;
}
```

### Application layer — the orchestrator

The application layer contains use cases. A use case coordinates domain objects to fulfill a single business scenario. It knows *what* needs to happen, but delegates the *how* to the domain (for rules) and to infrastructure (for persistence).

**What lives here:**

| Concept    | Role                                        | Example in this repo        |
| ---------- | ------------------------------------------- | --------------------------- |
| Use Cases  | Single business operation entry point       | `GetOrCreateUserUseCase`    |

**Rules for a use case:**

1. Receives **primitive inputs** (strings, numbers) from the presentation layer — not domain objects, not HTTP requests
2. Creates or retrieves **domain objects** via repositories
3. Calls **behavior methods** on domain objects (the use case never contains business rules itself)
4. Wraps operations in a **transaction** via the Unit of Work
5. Returns **domain objects** to the caller

```ts
// application/get-or-create-user.use-case.ts
export class GetOrCreateUserUseCase {
  constructor(private readonly _unitOfWork: UnitOfWorkService) {}

  async execute(auth0Id: string): Promise<User> {
    return await this._unitOfWork.execute(async (context) => {
      let user = await context.user.getByAuth0Id(Auth0Id.create(auth0Id));
      if (user !== null) return user;

      user = User.create({ auth0Id, email: null, firstName: null, lastName: null });
      await context.user.create(user);
      return user;
    });
  }
}
```

The use case imports from the domain layer only (`UnitOfWorkService`, `User`, `Auth0Id`). It never imports from presentation or infrastructure.

### Infrastructure layer — the adapters

The infrastructure layer provides concrete implementations for the interfaces defined in the domain layer. It is the bridge between the business logic and the outside world (database, authentication providers, external APIs).

**What lives here:**

| Concept                  | Role                                            | Example in this repo          |
| ------------------------ | ----------------------------------------------- | ----------------------------- |
| Repository implementations | Persist/retrieve aggregates via an ORM        | `UserPrismaRepository`        |
| DI tokens                | Symbol-based identifiers for injection          | `GET_OR_CREATE_USER_USE_CASE_TOKEN` |
| DI providers             | Factory functions that wire up dependencies     | `GET_OR_CREATE_USER_USE_CASE_PROVIDER` |
| Unit of Work implementation | Transaction management                       | `UnitOfWorkPrismaService`     |
| ORM service              | Database connection lifecycle                   | `PrismaService`               |

**Repository implementation example:**

```ts
// infrastructure/repositories/user.prisma-repository.ts
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly _prisma: Prisma.TransactionClient) {}

  async getByAuth0Id(auth0Id: Auth0Id): Promise<User | null> {
    const user = await this._prisma.user.findUnique({
      where: { auth0Id: auth0Id.toString() },
    });
    if (!user) return null;
    return User.fromPrimitives(user);   // Prisma row → domain aggregate
  }

  async create(user: User): Promise<void> {
    const primitives = user.toPrimitives();  // domain aggregate → plain data
    await this._prisma.user.create({ data: { /* ... */ } });
  }
}
```

The repository imports from the domain (`User`, `UserRepository`, `Auth0Id`) and from Prisma. The domain never imports from the repository. The dependency points inward.

**DI wiring pattern:**

```ts
// Token — a unique symbol to identify the service
export const GET_OR_CREATE_USER_USE_CASE_TOKEN = Symbol('GET_OR_CREATE_USER_USE_CASE_TOKEN');

// Provider — a factory that NestJS calls at bootstrap
export const GET_OR_CREATE_USER_USE_CASE_PROVIDER: Provider<GetOrCreateUserUseCase> = {
  inject: [PRISMA_UNIT_OF_WORK_TOKEN],
  provide: GET_OR_CREATE_USER_USE_CASE_TOKEN,
  useFactory: (unitOfWork: UnitOfWorkService) => new GetOrCreateUserUseCase(unitOfWork),
};
```

Tokens prevent string-based collisions and make dependencies explicit. Providers declare what they produce, what they need, and how to assemble it.

### Presentation layer — the delivery mechanism

The presentation layer handles HTTP concerns: routing, request parsing, response formatting, authentication, input validation, and output serialization. It translates between the outside world and the application layer.

**What lives here:**

| Concept        | Role                                              | Example in this repo              |
| -------------- | ------------------------------------------------- | --------------------------------- |
| Controllers    | HTTP routing and delegation to use cases           | `UserController`, `AppController` |
| Output DTOs    | Shape and document API responses                   | `UserOutputDto`                   |
| Input DTOs     | Validate and type incoming request bodies          | `EnvironmentVariablesInputDto`    |
| NestJS Modules | Wire controllers, providers, and imports together  | `UserModule`, `DatabaseModule`    |

**Controller example:**

```ts
// presentation/controllers/user.controller.ts
@Controller('user')
@ApiBearerAuth()
export class UserController {
  @Get()
  @Serialize(UserOutputDto)
  user(@CurrentUser() currentUser: User): UserOutputDto {
    return currentUser.toPrimitives();
  }
}
```

The controller receives a domain aggregate (injected by the JWT strategy via the `@CurrentUser()` decorator), converts it to primitives, and the `StrictSerializerInterceptor` transforms the output to match the DTO shape.

**Output DTO — explicit control of what leaves the API:**

```ts
export class UserOutputDto {
  @ApiProperty({ description: 'The user id', example: '019ad951-...' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'The user email', nullable: true })
  @Expose()
  email!: string | null;

  @ApiProperty({ description: 'First name', nullable: true })
  @Expose()
  firstName!: string | null;

  @ApiProperty({ description: 'Last name', nullable: true })
  @Expose()
  lastName!: string | null;
}
```

Only fields marked `@Expose()` appear in the response. The serializer operates with `strategy: 'excludeAll'` — everything is hidden unless explicitly exposed. This prevents accidental leakage of internal fields (auth0Id, timestamps, etc.).

---

## 4. Dependency Inversion in practice

Dependency Inversion is the mechanism that makes Clean Architecture work. The domain defines interfaces (what it needs); the infrastructure provides implementations (how it's done). NestJS DI wires them at runtime.

### The full chain for the User context

```
Domain layer defines:
  ├── UserRepository         (interface)
  └── UnitOfWorkService      (abstract class)
              ↑ implemented by
Infrastructure layer provides:
  ├── UserPrismaRepository   (implements UserRepository)
  ├── UnitOfWorkPrismaService (implements UnitOfWorkService)
  ├── PrismaService          (database connection)
  ├── Tokens                 (PRISMA_UNIT_OF_WORK_TOKEN, GET_OR_CREATE_USER_USE_CASE_TOKEN)
  └── Providers              (factories that assemble everything)
              ↑ consumed by
Application layer uses:
  └── GetOrCreateUserUseCase (receives UnitOfWorkService — doesn't know it's Prisma)
              ↑ called by
Presentation layer exposes:
  ├── JwtStrategy            (validates token, calls use case)
  └── UserController         (returns user to HTTP response)
```

At no point does the domain or application layer import `Prisma`, `@nestjs/common`, or any infrastructure class. The use case constructor takes `UnitOfWorkService` — an abstract class from the domain layer. The fact that it's backed by Prisma transactions is invisible to the business logic.

### Provider assembly

The `DatabaseModule` registers global providers at bootstrap:

```ts
DatabaseModule.forRoot() → {
  providers: [PRISMA_SERVICE_PROVIDER, PRISMA_UNIT_OF_WORK_PROVIDER],
  exports: [PRISMA_SERVICE_TOKEN, PRISMA_UNIT_OF_WORK_TOKEN],
  global: true,
}
```

Then the `UserModule` registers its own providers:

```ts
@Module({
  providers: [JwtStrategy, GET_OR_CREATE_USER_USE_CASE_PROVIDER],
  controllers: [UserController],
})
export class UserModule {}
```

NestJS resolves the dependency graph: `PrismaService` → `UnitOfWorkPrismaService` → `GetOrCreateUserUseCase` → `JwtStrategy` → `UserController`. Each step only knows about the interface, not the implementation.

---

## 5. Data flow across layers

Data changes shape at each layer boundary. This prevents internal details from leaking outward and external formats from polluting the domain.

### Inbound: HTTP request → domain

```
HTTP request body (JSON)
    │
    ▼  ValidationPipe parses and validates
Input DTO (class-validator decorators)
    │
    ▼  Controller extracts primitives
Primitive values (strings, numbers)
    │
    ▼  Use case calls factory methods
Domain objects (Aggregates, Value Objects)
```

### Outbound: domain → HTTP response

```
Domain aggregate
    │
    ▼  .toPrimitives()
Plain object (primitives interface)
    │
    ▼  StrictSerializerInterceptor applies @Serialize(OutputDto)
Output DTO (only @Expose() fields survive, strategy: 'excludeAll')
    │
    ▼  Fastify serializes
HTTP response body (JSON)
```

### Persistence: domain ↔ database

```
Domain aggregate
    │
    ▼  .toPrimitives()
Plain object ──────────────→ Prisma .create() / .update()
                                        │
                                        ▼
                              Database row (PostgreSQL)
                                        │
                                        ▼
                              Prisma query result
    │
    ▼  Aggregate.fromPrimitives()
Domain aggregate (reconstituted)
```

The domain never sees a Prisma model or a database row. It produces and consumes plain objects via `toPrimitives()` / `fromPrimitives()`. The repository handles the mapping.

---

## 6. Cross-cutting concerns

Some concerns span all layers. Clean Architecture handles them through dedicated infrastructure mechanisms registered globally.

### Authentication

```
JwtGuard (global) ──→ checks @Public() metadata
    │                  if not public:
    ▼
JwtStrategy ──────→ validates token via Auth0 JWKS
    │                  calls GetOrCreateUserUseCase
    ▼
request.user = User aggregate (available via @CurrentUser() decorator)
```

The guard and strategy live in the infrastructure layer. The domain `User` aggregate flows through the system. Controllers never handle token validation.

### Input validation

```
HTTP request ──→ ValidationPipe (global)
                   │
                   ▼
                 class-validator checks DTO decorators
                   │
                   ├── valid:   pass through
                   └── invalid: throw DtoValidationPresentationError → 400
```

The `ValidationPipe` is registered globally and applies to all incoming requests with a DTO. It enforces whitelisting (`forbidNonWhitelisted: true`) — unexpected properties are rejected.

### Output serialization

```
Controller return value ──→ StrictSerializerInterceptor (global)
                              │
                              ▼
                            check @Serialize() decorator exists (mandatory)
                              │
                              ▼
                            plainToInstance(OutputDto, data, { excludeAll })
                              │
                              ▼
                            validateSync() — verify transformed data
                              │
                              ├── valid:   respond
                              └── invalid: throw DtoValidationPresentationError → 400
```

Every controller method **must** use the `@Serialize(OutputDto)` decorator. The interceptor enforces this — missing the decorator throws an error. This guarantees that no endpoint can accidentally return raw domain data.

### Error handling

```
Any exception ──→ HttpExceptionFilter (global)
                    │
                    ▼
                  instanceof check against error hierarchy
                    │
                    ├── DomainError              → mapped status (400, 409)
                    ├── ApplicationError          → mapped status (404, 409)
                    ├── InfrastructureError       → mapped status (500)
                    ├── PresentationError         → mapped status (400, 401)
                    └── unknown                   → 500 Internal Server Error
                    │
                    ▼
                  Response: { status, body: { message, payload } }
```

The error mapper centralizes all error-to-HTTP-status associations in a single `Map`:

```ts
const errorHttpStatusByError = new Map([
  [ValidationDomainError, HttpStatus.BAD_REQUEST],           // 400
  [InvalidTransitionDomainError, HttpStatus.CONFLICT],       // 409
  [RessourceNotFoundApplicationError, HttpStatus.NOT_FOUND], // 404
  [UnauthorizedPresentationError, HttpStatus.UNAUTHORIZED],  // 401
  // ...
]);
```

Each layer throws its own error type with a `payload` for context. The filter catches everything, maps it, and produces a consistent response shape. The domain never imports `HttpStatus` — it only throws domain errors.

---

## 7. Benefits

### The domain is framework-free

The domain layer contains zero NestJS imports. No `@Injectable()`, no `@Module()`, no `HttpStatus`. If NestJS is replaced by Fastify standalone, Hono, or any other framework, the domain and application layers remain untouched. The business rules survive any framework migration.

### The database is swappable

Prisma appears only in the infrastructure layer. The domain defines `UserRepository` as an interface. Swapping Prisma for TypeORM, Drizzle, or raw SQL requires only rewriting the repository implementation and the Unit of Work service. The use cases, aggregates, and controllers are unaffected.

```
Before: UserPrismaRepository implements UserRepository
After:  UserTypeOrmRepository implements UserRepository
         (same interface, different implementation)
```

### Each layer is independently testable

- **Domain tests:** instantiate aggregates and value objects directly, assert invariants — no mocks, no DI container, no database
- **Application tests:** mock the Unit of Work context with fake repositories — no database, no HTTP
- **Presentation tests:** mock use cases injected via tokens — no business logic, no database
- **Integration tests:** spin up the real database, test the full vertical slice

The layered structure naturally creates testing boundaries.

### New features follow a predictable path

Every feature follows the same vertical slice:

1. Define/update domain objects (aggregates, value objects)
2. Create/update use case in the application layer
3. Implement/update repository in the infrastructure layer
4. Wire with token + provider
5. Expose via controller + DTO in the presentation layer

This predictability reduces decision fatigue and makes onboarding faster.

### Internal details never leak

The `StrictSerializerInterceptor` with `excludeAll` strategy guarantees that only `@Expose()` fields reach the HTTP response. Even if an aggregate has 20 fields, only the DTO-declared subset is visible. Adding a field to the domain does not accidentally expose it to the API.

### Error semantics are enforced structurally

A domain rule violation always produces a `DomainError`. A missing resource always produces an `ApplicationError`. An auth failure always produces a `PresentationError`. The global filter maps each to the correct HTTP status. Developers cannot accidentally return a 500 for a validation error — the architecture prevents it.

### Cross-cutting concerns are centralized

Authentication (JwtGuard), validation (ValidationPipe), serialization (StrictSerializerInterceptor), and error handling (HttpExceptionFilter) are registered once and apply globally. Individual controllers do not repeat this logic. A change to the error response format happens in one place.

### Boundaries make code reviews easier

A PR that modifies the domain layer should not contain Prisma imports. A PR that adds a controller should not contain business logic. The layer structure makes violations visible during review — wrong imports stand out immediately.

---

## 8. Drawbacks

### More files per feature

A single feature requires touching many files across many directories. Creating a "get payment by ID" endpoint involves at minimum:

```
domain/repositories/payment.repository.ts    (interface)
infrastructure/repositories/payment.prisma-repository.ts (implementation)
infrastructure/dependency-injection/payment.token.ts
infrastructure/dependency-injection/payment.provider.ts
application/get-payment.use-case.ts
presentation/controllers/payment.controller.ts
presentation/dto/outputs/payment.output-dto.ts
presentation/modules/payment.module.ts
```

For simple CRUD operations, this is heavy compared to a single controller + service file.

### Mapping boilerplate

Data transforms at every boundary:

- `toPrimitives()` to leave the domain
- `fromPrimitives()` to enter the domain
- `plainToInstance()` for DTO transformation
- Repository maps domain ↔ Prisma model

A new field must be added to: the aggregate, the primitives interface, `toPrimitives()`, `fromPrimitives()`, the repository implementation, the DTO, and possibly the migration. Missing any step causes a runtime error.

### Indirection hinders navigation

Following the execution path requires jumping across layers. A request to `GET /user` touches: `JwtGuard` → `JwtStrategy` → `GetOrCreateUserUseCase` → `UnitOfWorkPrismaService` → `UserPrismaRepository` → `UserController` → `StrictSerializerInterceptor`. IDE "go to definition" on a Symbol token leads to the token declaration, not the implementation.

The DI wiring with Symbol tokens and `useFactory` providers adds a level of indirection that plain constructor injection does not have. Understanding which concrete class backs a token requires reading the provider definition.

### Strict layering creates friction for simple cases

Not everything warrants four layers. A health check endpoint (`GET /` → `{ status: "ok" }`) still goes through the serializer interceptor and requires a DTO. A configuration read still flows through the same pipeline. The architecture does not distinguish between trivial and complex operations.

### Upfront design cost

Choosing boundaries (what belongs in domain vs application, where to put shared logic, how to split bounded contexts) requires design decisions before writing code. These decisions are hard to change later because they affect the entire directory structure and dependency graph.

### Circular dependency risk with NestJS modules

NestJS modules must declare their imports, providers, and exports explicitly. When two bounded contexts need each other's repositories (e.g., payment needs user data), circular module imports can occur. Resolving this requires `forwardRef()`, shared modules, or restructuring — adding complexity that a flat architecture does not have.

### The abstraction only pays off at scale

For a team of 1-2 developers working on a small API, the overhead of four layers, DI tokens, repository interfaces, and strict serialization may never pay for itself. Clean Architecture shines when multiple teams work on different bounded contexts in parallel, when technology changes are expected, or when the domain is complex enough that isolation prevents cascading bugs. For small, stable projects, the ceremony is a net cost.

### Performance awareness is harder

The domain is deliberately ignorant of the database. But efficient queries sometimes require knowledge of indexes, joins, and loading strategies. A use case that loads an aggregate with 1000 child entities (e.g., a Payment with many CreditTransfers) may need a different approach than `findUnique()` + `fromPrimitives()`. Optimizing this means either leaking persistence concerns into the domain or building dedicated read models (CQRS), adding yet another layer.
