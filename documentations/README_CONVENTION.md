# TypeScript Code Conventions

> Based on the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), adapted for our NestJS / TypeScript stack.
> Enforced automatically by [Biome 2.4.2](https://biomejs.dev/) — see `biome.json`.

---

## Table of contents

01. [Source files](#1-source-files)
02. [Imports & Exports](#2-imports--exports)
03. [Variables](#3-variables)
04. [Naming](#4-naming)
05. [Functions](#5-functions)
06. [Classes](#6-classes)
07. [Interfaces & Types](#7-interfaces--types)
08. [Arrays & Objects](#8-arrays--objects)
09. [Control flow](#9-control-flow)
10. [Error handling](#10-error-handling)
11. [Type system](#11-type-system)
12. [Comments & Documentation](#12-comments--documentation)
13. [Formatting](#13-formatting)
14. [Forbidden features](#14-forbidden-features)
15. [Review checklist](#15-review-checklist)

---

## 1. Source files

### Encoding and structure

All files are encoded in **UTF-8** with **LF** (`\n`) line endings.

A file follows this strict order:

```
1. License / Copyright (if needed)
2. @fileoverview JSDoc (if needed)
3. Imports
4. Implementation
```

Each section is separated by **exactly one blank line**.

### Special characters

Use named escape sequences (`\n`, `\t`, `\\`) rather than their numeric equivalents (`\x0a`, `\u000a`).

For non-ASCII characters, use the Unicode character directly when it is readable:

```ts
// ✅ Good
const units = 'μs';

// ❌ Bad — hard to read
const units = '\u03bcs';
```

---

## 2. Imports & Exports

### No default exports

Always use **named exports**. Default exports allow silent renaming and make maintenance harder.

```ts
// ✅ Good
export class UserService {}
export function createUser() {}
export const MAX_RETRIES = 3;

// ❌ Forbidden
export default class UserService {}
```

### Import type

Use `import type` when a symbol is used **only as a type**. Use `export type` for type re-exports.

```ts
// ✅ Good
import type { User } from './user';
import { UserService } from './user.service';

export type { UserDto } from './dto';

// ❌ Bad — imports a type as a value
import { User } from './user'; // if User is only used as a type
```

### Namespace vs Named imports

Prefer **named imports** for frequently used symbols. Use **namespace imports** when many symbols from the same API are needed.

```ts
// ✅ Named — for frequently used symbols
import { describe, it, expect } from 'vitest';

// ✅ Namespace — when many symbols from the same source
import * as tableview from './tableview';
let item: tableview.Item | undefined;

// ❌ Too verbose
import {
  Item as TableviewItem,
  Header as TableviewHeader,
  Row as TableviewRow,
} from './tableview';
```

### ES6 modules only

No `namespace`, no `require()`, no `/// <reference>`.

```ts
// ✅ Good
import { Foo } from './foo';

// ❌ Forbidden
namespace Rocket { ... }
import x = require('mydep');
/// <reference path="..." />
```

### No barrel files

Avoid `index.ts` files that only re-export. They hurt tree-shaking and build time.

```ts
// ❌ Forbidden — barrel file
export * from './user.service';
export * from './user.controller';
export * from './user.module';

// ✅ Good — import directly from the source file
import { UserService } from './user/user.service';
```

---

## 3. Variables

### `const` by default, `let` if necessary, never `var`

```ts
// ✅ Good
const maxRetries = 3;
let currentAttempt = 0;

// ❌ Forbidden
var count = 0;
```

### One variable per declaration

```ts
// ✅ Good
const a = 1;
const b = 2;

// ❌ Forbidden
const a = 1, b = 2;
```

### No use before declaration

A variable must never be referenced before its declaration in the code.

---

## 4. Naming

### Conventions by identifier type


| Style           | Applies to                                                               |
| --------------- | ------------------------------------------------------------------------ |
| `PascalCase`    | Classes, interfaces, types, enums, type parameters, React components     |
| `camelCase`     | Variables, parameters, functions, methods, properties, module aliases     |
| `CONSTANT_CASE` | Global constants, enum values, `static readonly`                         |


```ts
// ✅ Good
class UserService {}                    // PascalCase
interface PaymentGateway {}             // PascalCase
type CoffeeResponse = Latte | Americano; // PascalCase
enum SupportLevel { NONE, BASIC }       // PascalCase + CONSTANT_CASE members

const maxRetries = 3;                   // camelCase
function getUserById() {}               // camelCase

const API_BASE_URL = '/api/v1';         // CONSTANT_CASE
```

### Descriptive names

Names must be clear to a new reader. No ambiguous abbreviations.

```ts
// ✅ Good
errorCount
dnsConnectionIndex
referrerUrl
customerId

// ❌ Bad
n           // meaningless
nErr        // ambiguous abbreviation
cstmrId     // missing letters
kSecondsPerDay // Hungarian notation
```

**Exception**: variables with a very short scope (≤ 10 lines) may use a short name (e.g., `i`, `x`).

### Acronyms

Treat acronyms as whole words in camelCase/PascalCase:

```ts
// ✅ Good
loadHttpUrl
xmlParser
userId
newCustomerId

// ❌ Bad
loadHTTPURL
XMLParser
userID
newCustomerID
```

### Naming restrictions

- No `I` prefix on interfaces (no `IUserService`)
- No `opt_` prefix for optional parameters
- No Hungarian notation (`strName`, `bIsActive`)

---

## 5. Functions

### Prefer function declarations

For named top-level functions, prefer `function` over assigned arrow functions.

```ts
// ✅ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Avoid for named functions
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

**Exception**: arrow functions are acceptable when an explicit type annotation is required, or for nested functions/callbacks.

### No `function expressions`

Use arrow functions instead of `function` expressions for callbacks.

```ts
// ✅ Good
bar(() => {
  this.doSomething();
});

// ❌ Forbidden
bar(function() { ... });
```

### Arrow functions — concise body vs block

Use a concise body only if the return value is actually used. Otherwise, use a block.

```ts
// ✅ Good — the return value is used
const lengths = strings.filter((s) => s.length > 0).map((s) => s.length);

// ✅ Good — no return value, use a block
myPromise.then((v) => {
  console.log(v);
});

// ❌ Bad — console.log return value leaks
myPromise.then((v) => console.log(v));
```

### Default parameters

Place parameters with default values **last**. Default values must not have side effects.

```ts
// ✅ Good
function process(name: string, extraContext: string[] = []) {}

// ❌ Bad — the default parameter is not last
function process(extraContext: string[] = [], name: string) {}
```

### Rest parameters over `arguments`

```ts
// ✅ Good
function variadic(array: string[], ...numbers: number[]) {}

// ❌ Forbidden — never use arguments
function variadic() {
  console.log(arguments);
}
```

### Callbacks — pass arrow functions

Prefer passing an arrow function that explicitly forwards parameters, rather than a direct reference.

```ts
// ✅ Good — arguments are explicit
const numbers = ['11', '5', '3'].map((n) => parseInt(n, 10));

// ❌ Dangerous — parseInt receives the index as radix
const numbers = ['11', '5', '10'].map(parseInt);
// Result: [11, NaN, 2]
```

---

## 6. Classes

### No container classes

Do not create classes solely to group static methods/properties. Use function and constant exports instead.

```ts
// ❌ Forbidden
export class Container {
  static FOO = 1;
  static bar() { return 1; }
}

// ✅ Good
export const FOO = 1;
export function bar() { return 1; }
```

### Visibility

- **Never** write `public` explicitly (it is the default in TypeScript)
- Use `private` and `protected` to restrict access
- **Never** bypass visibility with `obj['foo']`

```ts
// ✅ Good
class Foo {
  bar = new Bar();
  constructor(public baz: Baz) {} // public allowed on non-readonly parameter properties
}

// ❌ Bad
class Foo {
  public bar = new Bar();                   // unnecessary public
  constructor(public readonly baz: Baz) {}  // readonly already implies public
}
```

### `private` keyword, not `#private` fields

Use TypeScript's `private` keyword rather than the ES `#` private fields syntax.

```ts
// ✅ Good
class Clazz {
  private ident = 1;
}

// ❌ Forbidden
class Clazz {
  #ident = 1;
}
```

### Systematic `readonly`

Mark `readonly` any property that is never reassigned outside the constructor.

### Parameter properties

Prefer parameter properties over manual assignment in the constructor.

```ts
// ✅ Good
class Foo {
  constructor(private readonly barService: BarService) {}
}

// ❌ Too verbose
class Foo {
  private readonly barService: BarService;
  constructor(barService: BarService) {
    this.barService = barService;
  }
}
```

### Field initialization

Initialize fields where they are declared whenever possible.

```ts
// ✅ Good
class Foo {
  private readonly userList: string[] = [];
}

// ❌ Unnecessarily in the constructor
class Foo {
  private readonly userList: string[];
  constructor() {
    this.userList = [];
  }
}
```

### Pure getters

A getter must **never** modify observable state. It must be a pure function.

```ts
// ✅ Good
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

// ❌ Forbidden — side effect in a getter
get nextId(): number {
  return this.counter++; // modifies state
}
```

### Constructor with parentheses

Always use parentheses when instantiating, even without arguments.

```ts
// ✅ Good
const x = new Foo();

// ❌ Forbidden
const x = new Foo;
```

---

## 7. Interfaces & Types

### Prefer `interface` over `type` for objects

```ts
// ✅ Good
interface User {
  firstName: string;
  lastName: string;
}

// ❌ Avoid for object shapes
type User = {
  firstName: string;
  lastName: string;
};
```

`type` remains appropriate for unions, tuples, and utility types.

### No nullable types in aliases

Do not include `| null` or `| undefined` in a type alias. Add it only at the usage site.

```ts
// ❌ Bad
type CoffeeResponse = Latte | Americano | undefined;

// ✅ Good
type CoffeeResponse = Latte | Americano;

class CoffeeService {
  getLatte(): CoffeeResponse | undefined { ... }
}
```

### Prefer `?` over `| undefined`

```ts
// ✅ Good
interface CoffeeOrder {
  sugarCubes: number;
  milk?: Whole | LowFat;
}

function pourCoffee(volume?: Milliliter) {}

// ❌ Less idiomatic
interface CoffeeOrder {
  sugarCubes: number;
  milk: Whole | LowFat | undefined;
}
```

### Structural types

Always annotate the type explicitly when declaring objects for better error detection.

```ts
// ✅ Good — error caught immediately
const foo: Foo = {
  bar: 123,
  bam: 'abc', // Error: 'bam' does not exist on Foo
};

// ❌ Bad — error caught only at usage
const foo = {
  bar: 123,
  bam: 'abc',
};
someFunction(foo); // the error appears here, far from the declaration
```

---

## 8. Arrays & Objects

### No `Array()` or `Object()` constructors

```ts
// ✅ Good
const a = [2, 3];
const obj = { a: 1 };

// ❌ Forbidden
const a = new Array(2, 3);
const obj = new Object();
```

### Array type syntax

Use `T[]` for simple types, `Array<T>` for complex types.

```ts
// ✅ Good
let a: string[];
let b: readonly string[];
let c: string[][];
let d: Array<{ n: number; s: string }>;
let e: Array<string | number>;

// ❌ Bad
let a: Array<string>;           // too verbose for a simple type
let d: { n: number; s: string }[];  // hard to read with braces
let e: (string | number)[];         // hard to read with parentheses
```

### Destructuring

Use destructuring for arrays and objects. Always provide default values in the pattern, not in the fallback.

```ts
// ✅ Good
const [a, b, c, ...rest] = generateResults();
function destructured({ num, str = 'default' }: Options = {}) {}

// ❌ Bad — defaults in the fallback
function destructured({ num, str }: Options = { num: 42, str: 'default' }) {}
```

### Spread syntax

Validate that the spread type matches the created type. Do not spread potentially `undefined` values.

```ts
// ✅ Good
const foo = shouldUseFoo ? [7] : [];
const bar = [5, ...foo];

// ❌ Bad — may spread undefined
const bar = [5, ...(shouldUseFoo && foo)];
```

---

## 9. Control flow

### Always use `{}` blocks

```ts
// ✅ Good
for (let i = 0; i < x; i++) {
  doSomething(i);
}

if (x) {
  doSomething(x);
}

// ❌ Forbidden
for (let i = 0; i < x; i++) doSomething(i);

if (x)
  doSomething(x);
```

### Strict equality `===`

Always use `===` and `!==`. The sole exception is `== null` to cover both `null` and `undefined`.

```ts
// ✅ Good
if (foo === 'bar') {}
if (foo == null) {} // covers null AND undefined

// ❌ Forbidden
if (foo == 'bar') {}
```

### No assignment in conditions

```ts
// ❌ Bad
if (x = someFunction()) { ... }

// ✅ Good
x = someFunction();
if (x) { ... }
```

### Switch — always a `default`

Every `switch` must have a `default` case (even if empty) in last position. Fall-through on non-empty cases is forbidden.

```ts
// ✅ Good
switch (x) {
  case Y:
    doSomething();
    break;
  case Z:
    doOther();
    break;
  default:
    // nothing to do
}
```

### Iteration

Prefer `for...of` to iterate over arrays. Never use `for...in` on arrays.

```ts
// ✅ Good
for (const x of someArr) { ... }

for (const [key, value] of Object.entries(someObj)) { ... }

// ❌ Forbidden on an array — yields indices as strings
for (const x in someArray) { ... }
```

---

## 10. Error handling

### Always `throw new Error()`

```ts
// ✅ Good
throw new Error('Something went wrong');
throw new MyCustomError('details');

// ❌ Forbidden
throw Error('Something went wrong');
throw 'oh noes!';          // never a string
throw undefined;           // never a non-Error
```

### Promise rejections

Promise rejections follow the same rules: always reject with an `Error` instance.

```ts
// ✅ Good
Promise.reject(new Error('failed'));
new Promise((_, reject) => reject(new Error('failed')));

// ❌ Forbidden
Promise.reject('failed');
Promise.reject();
```

### Catch — assume `Error`

Always treat the exception as an `Error` instance. Empty `catch` blocks are forbidden unless justified with a comment.

```ts
// ✅ Good
try {
  doSomething();
} catch (e: unknown) {
  if (e instanceof Error) {
    displayError(e.message);
  }
  throw e;
}

// ✅ Empty catch block with justification
try {
  return handleNumericResponse(response);
} catch (e: unknown) {
  // The response is not numeric, continue as text.
}
return handleTextResponse(response);

// ❌ Forbidden — empty catch without justification
try {
  riskyOperation();
} catch (e: unknown) {
}
```

### Focused `try` blocks

Limit code inside a `try` to what can actually throw an exception.

```ts
// ✅ Good
let result;
try {
  result = methodThatMayThrow();
} catch (e: unknown) { ... }
use(result);

// ❌ Less good — use() does not throw but is inside the try
try {
  const result = methodThatMayThrow();
  use(result);
} catch (e: unknown) { ... }
```

---

## 11. Type system

### No `any`

Use `unknown` when the type is unknown, or provide a more precise type.

```ts
// ✅ Good
const val: unknown = parseInput();
function nicestElement<T>(items: T[]): T { ... }

interface MyUserJson {
  name: string;
  email: string;
}

// ❌ Forbidden
const val: any = parseInput();
```

### Do not annotate trivially inferable types

```ts
// ✅ Good — the type is obvious
const x = 15;
const name = 'Alice';
const items = new Set<string>();

// ❌ Unnecessary — the type is trivial
const x: number = 15;
const name: string = 'Alice';
const items: Set<string> = new Set();
```

### Useful annotations on complex expressions

```ts
// ✅ Good — helps the reader
const value: string[] = await rpc.getSomeValue().transform();

// ❌ Hard to understand without annotation
const value = await rpc.getSomeValue().transform();
```

### Type assertions — `as` syntax

Always use `as` rather than angle brackets `<Type>`.

```ts
// ✅ Good
const x = (z as Foo).length;

// ❌ Forbidden
const x = (<Foo>z).length;
```

### No wrapper types

Use lowercase primitive types, never the wrappers.

```ts
// ✅ Good
let s: string;
let b: boolean;
let n: number;

// ❌ Forbidden
let s: String;
let b: Boolean;
let n: Number;
```

### Type coercion

- Use `String()`, `Boolean()`, `Number()` (without `new`) or template literals
- **Never** use unary `+` to convert to a number
- **Never** use `parseInt`/`parseFloat` without format validation

```ts
// ✅ Good
const str = String(aNumber);
const bool = Boolean(value);
const str2 = `result: ${someValue}`;
const num = Number(input);
if (isNaN(num)) throw new Error('Invalid number');

// ❌ Forbidden
const num = +input;
const n = parseInt(someString, 10); // without prior validation
```

### No `@ts-ignore`

**Never** use `@ts-ignore`, `@ts-expect-error` (except in tests), or `@ts-nocheck`.

---

## 12. Comments & Documentation

### JSDoc for docs, `//` for implementation

- `/** JSDoc */`: documentation intended for code consumers
- `// comment`: internal implementation notes

### Multi-line comments

Use multiple `//` rather than `/* */`.

```ts
// ✅ Good
// This is a comment
// spanning multiple lines

// ❌ Avoid
/* This is a comment
   spanning multiple lines */
```

### JSDoc — do not redeclare types

In TypeScript, types are in the code. JSDoc must **not** duplicate type information.

```ts
// ✅ Good
/**
 * Sends the request to start brewing.
 * @param amountLitres The amount to brew. Must fit in the pot!
 */
brew(amountLitres: number, logger: Logger) {}

// ❌ Bad — @param redeclares the type
/**
 * @param {number} amountLitres
 * @param {Logger} logger
 */
brew(amountLitres: number, logger: Logger) {}
```

### Document exports

All top-level exports must have a JSDoc comment, unless their name is perfectly self-descriptive.

### JSDoc before decorators

```ts
// ✅ Good
/** Component that displays the dashboard. */
@Component({ selector: 'dashboard' })
export class DashboardComponent {}

// ❌ Bad — JSDoc between the decorator and the class
@Component({ selector: 'dashboard' })
/** Component that displays the dashboard. */
export class DashboardComponent {}
```

### "Parameter name" comments at call sites

When the meaning of an argument is not obvious, add a `/* param= */` comment.

```ts
someFunction(obviousParam, /* shouldRender= */ true, /* name= */ 'hello');
```

---

## 13. Formatting

All formatting is handled automatically by **Biome**. Here are the applied settings:


| Rule              | Value                            |
| ----------------- | -------------------------------- |
| Indentation       | 2 spaces                         |
| Line width        | 80 characters                    |
| Quotes            | Single `'` (double `"` in JSX)   |
| Semicolons        | Always                           |
| Trailing commas   | Everywhere                       |
| Arrow parentheses | Always `(x) => ...`              |
| Line ending       | LF                               |


Run `biome check --write` before each commit to format and auto-fix.

---

## 14. Forbidden features

The following are **strictly forbidden** in the codebase:


| Forbidden                                         | Reason                                         |
| ------------------------------------------------- | ---------------------------------------------- |
| `var`                                             | Complex scoping and source of bugs             |
| `eval()` / `Function('...')`                      | Security risk, incompatible with CSP           |
| `debugger`                                        | Not for production                             |
| `with`                                            | Forbidden in strict mode since ES5             |
| `namespace`                                       | Use ES6 modules                                |
| `const enum`                                      | Invisible to JS consumers                      |
| `new String()` / `new Boolean()` / `new Number()` | Misleading behavior                            |
| `require()`                                       | Use ES6 `import`                               |
| Default exports                                   | Hard maintenance and silent renaming           |
| `#private` fields                                 | Performance overhead, use TS `private`          |
| `@ts-ignore` / `@ts-nocheck`                      | Hides type errors                              |
| Direct `prototype` manipulation                   | Use ES6 classes                                |
| Custom decorators                                 | Only those from frameworks (Angular, etc.)     |


---

## 15. Review checklist

Items **not automatable** by Biome to verify manually in code review:

### Structure

- File order is respected: license → fileoverview → imports → code
- Imports are organized (namespace vs named) consistently

### Naming

- No `I` prefix on interfaces
- Acronyms are treated as words (`loadHttpUrl`, not `loadHTTPURL`)
- Names are descriptive and understandable without context

### Classes

- No explicit `public` (except non-readonly parameter properties)
- No `#private` fields — use `private`
- `readonly` on every non-reassigned property
- Getters are pure functions (no side effects)

### Functions

- Named functions use `function` declarations (not `const fn = () =>`)
- Callbacks pass arguments explicitly

### Types

- `interface` over `type` for object shapes
- No `| null` / `| undefined` in type aliases
- Use `?` over `| undefined` for optional properties
- Types explicitly annotated on complex expressions
- Type assertions justified with a comment

### Documentation

- All top-level exports are documented with JSDoc
- Multi-line comments use `//`, not `/* */`
- JSDoc does not redeclare TypeScript types
- JSDoc is placed before decorators, not between them

### Conversions

- No unary `+` to convert to a number
- `Number()` with `isNaN` / `isFinite` check
- No `parseInt` / `parseFloat` without prior format validation
