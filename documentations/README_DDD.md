# Domain-Driven Design (DDD)

This document explains the DDD concepts applied in this repository and how they translate into code.

---

## Table of contents

01. [What is DDD?](#1-what-is-ddd)
02. [Strategic design](#2-strategic-design)
03. [Tactical design](#3-tactical-design)
04. [Clean Architecture layers](#4-clean-architecture-layers)
05. [How it all connects](#5-how-it-all-connects)
06. [Benefits](#6-benefits)
07. [Drawbacks](#7-drawbacks)

---

## 1. What is DDD?

Domain-Driven Design is a software design approach coined by Eric Evans in 2003. Its core principle is simple: **the structure of the code should mirror the structure of the business domain**.

Rather than designing around technical concerns (database tables, HTTP routes, frameworks), DDD organizes code around business concepts, rules, and workflows. The result is a codebase where domain experts and developers share the same vocabulary and the code serves as living documentation of the business.

DDD operates at two levels:

- **Strategic design** — splitting a complex domain into manageable parts (Bounded Contexts)
- **Tactical design** — building blocks inside each context (Aggregates, Entities, Value Objects, etc.)

---

## 2. Strategic design

### Bounded Contexts

A Bounded Context is an explicit boundary within which a domain model lives. Each context has its own language, its own models, and its own rules. The same word can mean different things in different contexts.

In this repository, two bounded contexts exist:

```
modules-business/
├── payment/    ← SEPA payment processing (ISO 20022)
└── user/       ← User identity management (Auth0)
```

A `User` in the user context has an Auth0Id, an email, a name. In the payment context, the same person is a `Party` (debtor or creditor) with an IBAN, a BIC, and a country. These are deliberately separate models — they live in different contexts and evolve independently.

### Ubiquitous Language

Each bounded context uses vocabulary from its domain. The payment context speaks ISO 20022: `CreditTransfer`, `Party`, `ControlSum`, `ServiceLevel`, `EndToEndId`. These are not invented abstractions — they are the actual terms used by domain experts (banking, SEPA regulation).

This vocabulary is reflected in class names, method names, enum values, and JSDoc comments:

```ts
// payment.enums.ts — enum values match ISO 20022 codes
export const PAYMENT_STATUS = {
  initiated: 'ACSP',  // Accepted, settlement in process
  cleared: 'ACCC',    // Cleared between banks
  settled: 'ACSC',    // Settled on creditor's account
  rejected: 'RJCT',   // Rejected
  // ...
} as const;
```

---

## 3. Tactical design

### Value Objects

A Value Object is an immutable object defined by its attributes, not by an identity. Two Value Objects with the same data are considered equal. They validate their own constraints at construction.

**In this repo:** `Money`, `Iban`, `Bic`, `Party`, `EndToEndId`, `Email`, `Auth0Id`, `Uuid`

**Pattern used:**

```ts
export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  // 1. Private constructor — cannot be called from outside
  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }

  // 2. Factory method — validates, then creates
  static create(amount: number, currency: string): Money {
    // Validation: no negative amounts, ISO 4217 currency, max 18 digits
    Money._validate(amount, currency);
    return new Money(amount, currency);
  }

  // 3. Operations return new instances (functional style)
  add(other: Money): Money {
    this._assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  // 4. Equality by value, not reference
  equals(other: Money): boolean {
    return this._amount === other._amount
      && this._currency === other._currency;
  }
}
```

**Key principles:**
- **Private constructor** forces creation through `create()`, guaranteeing validation
- **Immutability** (`readonly`) — once created, a Value Object never changes
- **Self-validating** — invalid state is impossible (e.g., an `Iban` always has a valid MOD-97 checksum)
- **No identity** — two `Money(100, "EUR")` are considered the same

**Composition:** Value Objects can contain other Value Objects. A `Party` composes an `Iban`, a `Bic`, a name, and a country:

```ts
export class Party {
  private readonly _name: string;
  private readonly _account: Iban;    // VO inside VO
  private readonly _agent: Bic;       // VO inside VO
  private readonly _country: string;
}
```

### Entities

An Entity is an object with a unique identity that persists over time. Unlike Value Objects, two Entities with the same data but different IDs are different.

**In this repo:** `CreditTransfer` (child entity of the Payment aggregate)

```ts
export class CreditTransfer {
  private readonly _id: Uuid;           // ← identity
  private readonly _endToEndId: EndToEndId;
  private readonly _amount: Money;      // VO
  private readonly _creditor: Party;    // VO
  private readonly _remittanceInfo: string | null;
}
```

An Entity belongs to an Aggregate. It is never accessed or persisted independently — always through its parent Aggregate Root.

### Aggregates

An Aggregate is a cluster of domain objects (entities + value objects) treated as a single unit. The Aggregate Root is the entry point — all external interactions go through it. The root enforces business invariants that span the whole cluster.

**In this repo:** `Payment` (root) + `CreditTransfer[]` (child entities)

```ts
export class Payment {
  private readonly _id: Uuid;
  private _status: PaymentStatus;         // mutable — changes via behavior methods
  private readonly _debtor: Party;
  private readonly _creditTransfers: CreditTransfer[];
  private _domainEvents: DomainEvent[] = [];

  // Private constructor — creation only through factories
  private constructor(props: PaymentProps) { /* ... */ }
```

**Invariants protected by the Aggregate Root:**

```ts
static create(input: CreatePaymentInput): Payment {
  // Invariant 1: at least one credit transfer
  if (input.creditTransfers.length === 0) {
    throw new ValidationDomainError('A payment must contain at least one credit transfer.');
  }

  // Invariant 2: execution date not in the past
  if (input.requestedExecutionDate < today) {
    throw new ValidationDomainError('Requested execution date cannot be in the past.');
  }

  // Invariant 3: all transfers share the same currency
  const currencies = new Set(creditTransfers.map((ct) => ct.amount.currency));
  if (currencies.size > 1) {
    throw new ValidationDomainError('All credit transfers must use the same currency.');
  }

  // ... creation + domain event emission
}
```

**State machine — behavior methods enforce transitions:**

```
  Initiated ──→ Cleared ──→ Settled
      │             │
      └─────────────┴──→ Rejected
```

```ts
markAsCleared(clearingReference: string): void {
  this._assertStatus(PAYMENT_STATUS.initiated, 'clear');  // guard
  this._status = PAYMENT_STATUS.cleared;                   // transition
  this._domainEvents.push(new PaymentClearedEvent(/*...*/)); // event
}

reject(reasonCode: string): void {
  // Can reject from Initiated or Cleared
  if (!rejectableStatuses.includes(this._status)) {
    throw new InvalidTransitionDomainError(/* ... */);
  }
  this._status = PAYMENT_STATUS.rejected;
  this._domainEvents.push(new PaymentRejectedEvent(/*...*/));
}
```

**Two factory methods with distinct roles:**
- `create()` — business creation: validates invariants, generates ID, emits domain events
- `fromPrimitives()` — hydration from database: no validation, no events (the data was already valid when it was saved)

### Domain Events

A Domain Event captures something meaningful that happened in the domain. Events are immutable data carriers created during state transitions.

**In this repo:** `PaymentInitiatedEvent`, `PaymentClearedEvent`, `PaymentSettledEvent`, `PaymentRejectedEvent`

```ts
export abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly paymentId: string;
  abstract readonly eventType: string;
}

export class PaymentRejectedEvent extends DomainEvent {
  readonly eventType = 'payment.rejected';
  readonly reasonCode: string;

  constructor(paymentId: string, reasonCode: string) {
    super({ paymentId, occurredAt: new Date() });
    this.reasonCode = reasonCode;
  }
}
```

Events are accumulated in the aggregate (`_domainEvents` array) and can be dispatched after persistence. This decouples the "what happened" from the "what to do about it" (send an email, update a read model, etc.).

### Repository

A Repository provides an illusion of an in-memory collection for aggregates. The domain layer defines the **interface** (what it needs); the infrastructure layer provides the **implementation** (how it's done).

**Domain layer — the interface:**

```ts
// user/domain/repositories/user.repository.ts
export interface UserRepository {
  create(user: User): Promise<void>;
  getByAuth0Id(auth0Id: Auth0Id): Promise<User | null>;
}
```

**Infrastructure layer — the Prisma implementation:**

```ts
// user/infrastructure/repositories/user.prisma-repository.ts
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
    const primitives = user.toPrimitives();  // domain aggregate → plain object
    await this._prisma.user.create({ data: { /* ... */ } });
  }
}
```

The domain code never imports Prisma, SQL, or any persistence technology. It only knows about the `UserRepository` interface.

### Use Cases (Application Services)

A Use Case orchestrates domain objects to fulfill a business scenario. It is the entry point from the outside world into the domain.

**In this repo:** `GetOrCreateUserUseCase`

```ts
export class GetOrCreateUserUseCase {
  constructor(private readonly _unitOfWork: UnitOfWorkService) {}

  async execute(auth0Id: string): Promise<User> {
    return await this._unitOfWork.execute(async (context): Promise<User> => {
      let user = await context.user.getByAuth0Id(Auth0Id.create(auth0Id));

      if (user !== null) {
        return user;
      }

      user = User.create({ auth0Id, email: null, firstName: null, lastName: null });
      await context.user.create(user);
      return user;
    });
  }
}
```

**Characteristics:**
- Receives primitive inputs (strings, numbers) — not domain objects
- Creates/retrieves domain objects via repositories
- Delegates business rules to the domain (the use case does not validate, the aggregate does)
- Wraps operations in a Unit of Work (transaction)
- Returns domain objects to the presentation layer

### Unit of Work

The Unit of Work ensures all repository operations within a use case execute in a single database transaction. If one operation fails, everything rolls back.

**Abstract interface (domain layer):**

```ts
export abstract class UnitOfWorkService {
  abstract execute<T>(
    callback: (context: UnitOfWorkContextService) => Promise<T>,
  ): Promise<T>;
}
```

**Prisma implementation (infrastructure layer):**

```ts
export class UnitOfWorkPrismaService implements UnitOfWorkService {
  execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T> {
    return this._prismaService.$transaction((tx: Prisma.TransactionClient) => {
      const user = new UserPrismaRepository(tx);  // all repos share the same tx
      const context: UnitOfWorkContextService = { user };
      return callback(context);
    });
  }
}
```

The callback receives a context object containing all repositories bound to the same transaction. This guarantees consistency across multiple writes.

### Error Hierarchy

Each layer has its own error classes. This prevents leaking internal details (e.g., a Prisma error reaching the HTTP response) and enables precise HTTP status mapping.

```
Domain layer
├── ValidationDomainError           → 400 Bad Request
└── InvalidTransitionDomainError    → 409 Conflict

Application layer
├── RessourceNotFoundApplicationError     → 404 Not Found
└── RessourceAlreadyExistsApplicationError → 409 Conflict

Infrastructure layer
└── ValidationInfrastructureError   → 500 Internal Server Error

Presentation layer
├── DtoValidationPresentationError  → 400 Bad Request
└── UnauthorizedPresentationError   → 401 Unauthorized
```

A global `HttpExceptionFilter` catches all errors and maps them to the appropriate HTTP status using `instanceof` checks.

---

## 4. Clean Architecture layers

Each bounded context is organized in four layers with a strict dependency rule: **each layer may only depend on inner layers, never on outer layers**.

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTATION                                                        │
│  NestJS controllers, DTOs, modules, guards, interceptors             │
│  Converts HTTP ↔ application calls. No business logic.               │
└──────────────────────────────────────────────────────────────────────┘
                              │ depends on ↓
┌──────────────────────────────────────────────────────────────────────┐
│  APPLICATION                                                         │
│  Use cases. Orchestrates domain objects. No HTTP knowledge.          │
└──────────────────────────────────────────────────────────────────────┘
                              │ depends on ↓
┌──────────────────────────────────────────────────────────────────────┐
│  DOMAIN                                                              │
│  Aggregates, Entities, Value Objects, Events, Repository interfaces  │
│  Pure business logic. No framework, no database, no IO.              │
└──────────────────────────────────────────────────────────────────────┘
                              ↑ implements
┌──────────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE                                                      │
│  Prisma repositories, DI providers/tokens, external services         │
│  Implements domain interfaces. Depends on domain, not the reverse.   │
└──────────────────────────────────────────────────────────────────────┘
```

**In the file system:**

```
modules-business/user/
├── domain/
│   ├── aggregates/user.aggregate.ts
│   ├── value-objects/auth0Id.vo.ts
│   └── repositories/user.repository.ts       ← interface
├── application/
│   └── get-or-create-user.use-case.ts
├── infrastructure/
│   ├── repositories/user.prisma-repository.ts ← implements interface
│   └── dependency-injection/
│       ├── user.token.ts
│       └── user.provider.ts
└── presentation/
    ├── controllers/user.controller.ts
    ├── dto/outputs/user.output-dto.ts
    └── modules/user.module.ts
```

### Dependency Inversion in practice

The domain layer defines an abstract `UserRepository` interface. The infrastructure layer provides a `UserPrismaRepository` that implements it. NestJS dependency injection wires them together via symbol tokens:

```ts
// Token (infrastructure)
export const GET_OR_CREATE_USER_USE_CASE_TOKEN = Symbol('GET_OR_CREATE_USER_USE_CASE_TOKEN');

// Provider (infrastructure)
export const GET_OR_CREATE_USER_USE_CASE_PROVIDER: Provider = {
  inject: [PRISMA_UNIT_OF_WORK_TOKEN],
  provide: GET_OR_CREATE_USER_USE_CASE_TOKEN,
  useFactory: (unitOfWork: UnitOfWorkService) => new GetOrCreateUserUseCase(unitOfWork),
};
```

The use case constructor receives `UnitOfWorkService` (abstract class from the domain layer) — it has no idea it's backed by Prisma.

### Serialization boundary

Domain objects expose `toPrimitives()` to convert to plain objects. Presentation DTOs use `@Expose()` decorators to control what reaches the HTTP response. A `StrictSerializerInterceptor` validates that every response conforms to its DTO — preventing accidental data leakage.

```
Domain Aggregate → .toPrimitives() → plain object → DTO transformation → HTTP response
```

---

## 5. How it all connects

Here is the full request flow for `GET /user` (authenticated):

```
1. HTTP request with Bearer token
         │
         ▼
2. JwtGuard checks @Public() metadata → not public → runs JWT strategy
         │
         ▼
3. JwtStrategy validates token against Auth0 JWKS
   Extracts payload: { sub: "auth0|abc123" }
         │
         ▼
4. JwtStrategy calls GetOrCreateUserUseCase.execute("auth0|abc123")
         │
         ▼
5. Use case opens Unit of Work transaction
   ├── context.user.getByAuth0Id(Auth0Id.create("auth0|abc123"))
   │   └── UserPrismaRepository queries DB within transaction
   │       └── User.fromPrimitives(dbRow)  → domain aggregate
   │
   ├── If user exists → return it
   └── If not → User.create({...}) → context.user.create(user) → return it
         │
         ▼
6. User aggregate stored in request.user
         │
         ▼
7. UserController receives @CurrentUser() → user.toPrimitives()
         │
         ▼
8. StrictSerializerInterceptor transforms to UserOutputDto
   Validates all @Expose() fields, strips everything else
         │
         ▼
9. HTTP response: { id, email, firstName, lastName }
```

---

## 6. Benefits

### Business logic is isolated and testable

The domain layer has zero dependencies on frameworks, databases, or HTTP. Domain classes are pure TypeScript — they can be unit-tested with nothing more than `new` and `assert`:

```ts
it('should reject a payment with an invalid transition', () => {
  const payment = createSettledPayment();
  expect(() => payment.reject('AC01')).toThrow(InvalidTransitionDomainError);
});
```

No mocks, no database, no DI container. Tests run in milliseconds.

### Invalid state is unrepresentable

Value Objects validate at construction. If you have a `Money` instance, you know the amount is non-negative, the currency is ISO 4217, and the digits fit ISO 20022 limits. If you have an `Iban`, you know the checksum is correct. This eliminates defensive checks scattered throughout the codebase.

### The code speaks the domain language

A developer reading `payment.markAsCleared(clearingReference)` understands the business operation without documentation. The state machine is explicit in the code. ISO 20022 codes appear as enum values. Domain experts can review the aggregate and recognize their workflows.

### Technology changes stay local

Swapping Prisma for TypeORM, or PostgreSQL for MongoDB, only affects repository implementations in the infrastructure layer. The domain, application, and presentation layers remain untouched. The same applies to authentication (swap Auth0 for Keycloak), serialization, or the HTTP framework itself.

### Aggregate boundaries protect consistency

All modifications to a Payment and its CreditTransfers go through the `Payment` aggregate root. There is no way to create a CreditTransfer with an invalid currency or move a Payment to an impossible status — the aggregate prevents it. This replaces fragile database constraints with expressive, testable business rules.

### Domain events decouple side effects

When a payment is rejected, the aggregate records a `PaymentRejectedEvent` without knowing who cares. Sending a notification email, updating a dashboard, or triggering a retry workflow is someone else's concern. This keeps the domain clean and makes it easy to add new reactions without modifying existing code.

### Error semantics are preserved across layers

A `ValidationDomainError` always maps to `400 Bad Request`. An `InvalidTransitionDomainError` always maps to `409 Conflict`. The error hierarchy prevents ambiguous error handling and provides structured context (`payload`) for debugging.

---

## 7. Drawbacks

### Higher initial complexity

A simple CRUD feature requires creating at minimum: a Value Object, an Aggregate, a Repository interface, a Repository implementation, a Use Case, a Provider, a Token, a DTO, a Controller, and a Module. For trivial domains, this ceremony adds overhead without proportional benefit.

### More boilerplate code

Every domain object needs `toPrimitives()`, `fromPrimitives()`, `equals()`, and validation logic. Every layer boundary involves mapping between representations (domain ↔ primitives ↔ DTO). This repetitive code can feel excessive, especially early in a project.

### Steeper learning curve

Developers unfamiliar with DDD must understand: aggregates vs entities vs value objects, invariant protection, factory patterns, dependency inversion, the unit of work, domain events, and layered architecture. Onboarding takes longer than a flat MVC structure.

### Risk of over-engineering

Not every module needs the full DDD treatment. A settings page or a feature flag system might work perfectly with a simple service + repository, without aggregates or domain events. Applying DDD uniformly to the entire codebase can result in unnecessary abstraction.

### Mapping overhead

Data passes through multiple transformations: DB row → `fromPrimitives()` → domain aggregate → `toPrimitives()` → DTO → HTTP response. Each layer boundary is a mapping step that must be maintained. A new field requires changes in the aggregate, the primitives interface, the repository, the DTO, and possibly the migration.

### Aggregate design is hard

Choosing the right aggregate boundaries is the most difficult DDD decision. Too large and you get contention (two users cannot modify the same aggregate concurrently). Too small and you lose transactional consistency. Getting this wrong is costly to fix later because it affects the entire vertical slice.

### Domain events add eventual complexity

While domain events are not yet dispatched asynchronously in this repo, adopting them at scale introduces eventual consistency: a listener may process an event after a delay, a handler may fail and need retries, event ordering may matter. The mental model shifts from synchronous request-response to asynchronous workflows.

### Persistence ignorance has limits

The domain is designed without knowledge of the database, but in practice, performance concerns leak in: eager vs lazy loading of `CreditTransfer[]`, pagination of large aggregates, and query optimization for read paths. A separate read model (CQRS) may become necessary, adding even more complexity.
