**1. Introduction**

This document outlines the coding practices, patterns, and architectural guidelines for the [Your Project Name] project. Our goal is to build a maintainable, testable, scalable, and understandable codebase, drawing heavily upon the principles outlined in *Effective TypeScript*, *Efficient Node.js*, and inspired by the functional purity and strong typing paradigms exemplified in Haskell (as explored in resources like the *Haskell Cookbook*). We value functional programming principles, utilize EffectTS for effect management within a Hexagonal Architecture, and leverage Node.js efficiently.

**2. Core Principles**

*   **Functional First & Immutability (ET Item 14, Haskell Ch 1):** Prefer pure functions and immutable data structures *always*. Use `readonly` extensively. Leverage EffectTS's immutable data structures (`Chunk`, `HashMap`, etc.). Avoid in-place mutation.
*   **Type Safety & Soundness (ET Ch 5):** Strive for maximum type safety via TypeScript's static analysis. Explicitly acknowledge TypeScript's known unsoundness traps (ET Item 48) and actively mitigate them (e.g., prefer `unknown` over `any` (ET Item 46), validate array/object lookups, be cautious with type assertions).
*   **Algebraic Data Types (ADTs) (ET Item 29, Haskell Ch 3):** Model domain states and variations using TypeScript's discriminated unions (`type Result = Success | Failure`), inspired by Haskell's sum and product types. Aim to make invalid states unrepresentable.
*   **Explicit Error & Absence Handling (ET Item 33, Haskell Ch 3 - Maybe/Either):** Use `Effect.Either<E, A>` for expected failures and `Effect.Option<A>` for optional values. Avoid returning `null`, `undefined`, or magic values (like `-1`) from functions to indicate absence or standard errors (ET Item 36). Handle these explicitly.
*   **Hexagonal Architecture:** Maintain strict separation: core (domain, ports) vs. infrastructure (adapters). Dependencies point inwards.
*   **Effect System (EffectTS):** Model *all* interactions with the outside world (IO, randomness, time, errors, state) as `Effect` values. Effects are first-class values describing computations.
*   **Composition (Haskell Ch 2):** Build complex logic by composing smaller, reusable pure functions (`pipe`, `flow`) and effects (`Effect.flatMap`, `Effect.zip`, `Effect.all`).
*   **Explicit Dependencies:** Use EffectTS `Layer` and `Context` (`Tag`).
*   **Node.js Efficiency (EN Ch 1, 3, 6, 7, 9):** Be mindful of the event loop. Use async APIs via EffectTS. Use Streams (`@effect/platform/Stream`) for large data. Offload CPU-bound work (`Effect.fork`, workers).
*   **Testability (EN Ch 8, ET Item 77):** Design for testability. Test pure logic directly. Test effects via `Effect.provide` and mock layers. Types and tests are complementary.

**3. TypeScript Configuration (`tsconfig.json`)**

*(No major changes from v1.1, still enforce strictness)*

*   **`"strict": true` is mandatory.** (ET Item 2)
*   **`noImplicitAny` is mandatory.** (ET Item 83)
*   Target modern ECMAScript (`"target": "ES2022"` or later). (ET Item 79)
*   Use modern ES Modules (`"module": "NodeNext"`, `"moduleResolution": "NodeNext"`).
*   Enable source maps (`"sourceMap": true`). (ET Item 73)
*   Enable declaration files (`"declaration": true`, `"declarationMap": true`) for libraries/project references. (ET Item 66, 73)

**4. Naming Practices**

*(Minor refinements based on clarity)*

*   **Use Domain Language:** Names must reflect the domain accurately (ET Item 41).
*   **Meaningful Distinctions:** Use consistent names for the same concept; use different names *only* for different concepts (ET Item 41).
*   **Functions/Effects:** Verbs for effects (`saveUser`), nouns/phrases for pure results (`calculatedTax`).
*   **Types:** `PascalCase`. Interfaces for object shapes, `type` for unions/aliases/complex types (ET Item 13). Ports describe roles (`UserRepository`), Adapters describe implementation (`PostgresUserRepository`). Use specific branded types (`OrderId`) over primitives where it enhances safety (ET Item 64).
*   **Avoid Type in Names** (ET Item 31), except for units (`durationMs`).

*   **Example 1 (Domain Naming & Branded Types):**
    ```typescript
    import { Brand } from "effect";

    // Good: Specific, uses domain language and branding
    type UserId = Brand.Branded<string, "UserId">;
    const UserId = Brand.nominal<UserId>();
    interface ShoppingCart { readonly id: Brand.Branded<string, "CartId">; /* ... */ }

    // Bad: Too generic or leaks implementation
    // type ID = string;
    // interface CartData { /* ... */ }
    ```
*   **Example 2 (Function/Effect Naming):**
    ```typescript
    import { Effect } from "effect";
    import { Order } from "../domain/Order";

    // Good: Pure transformation
    const orderTotal = (order: Order): number => { /* ... */ };

    // Good: Effectful action
    const submitOrder = (order: Order): Effect.Effect<PaymentGateway, PaymentError, void> => { /* ... */};
    ```

**5. Coding Practices (FP, EffectTS, TypeScript & Node.js Focus)**

*   **Immutability:** Enforce with `readonly` (ET Item 14). Use Effect/fp-ts immutable structures.
*   **Purity:** Separate pure logic from `Effect` definitions.
*   **Effect Management:**
    *   Use EffectTS abstractions for Node.js APIs where available (e.g., `@effect/platform-node`'s `FileSystem`, `Http`).
    *   Chain effects using `Effect.flatMap` (like Haskell's `>>=`) and `Effect.map` (like Haskell's `fmap` or `<$>`). Use `Effect.gen` for more complex sequences.
    *   Use `Effect.forEach` for iterating and performing effects, preferring it over manual loops with effects inside where applicable.
*   **Error Handling:** Model expected errors with typed error channels (`Effect<R, E, A>`). Use `Effect.catchTag`, `Effect.catchTags` for specific error recovery.
*   **Data Validation:** Use `@effect/schema/Schema` at boundaries.
*   **Dependency Injection:** Use `Layer` / `Tag`.
*   **Prefer Functional Iteration:** Use `map`, `filter`, `reduce`, `Effect.forEach`, `Stream.map`, etc., over imperative loops (`for`, `while`) when operating on collections or streams (Haskell Ch 2, ET Item 26). While recursion is fundamental in Haskell, prefer built-in HOFs in TS for clarity and performance unless recursion is clearly simpler or required (e.g., traversing tree-like structures).

*   **Example 1 (Using `Effect.forEach`):**
    ```typescript
    import { Effect, ReadonlyArray } from "effect";
    import { ProductId } from "../domain/Product";
    import { ProductRepository } from "../ports/ProductRepository";

    // Assume checkAvailability returns Effect<..., ..., boolean>
    declare const checkAvailability: (id: ProductId) => Effect.Effect<ProductRepository, DbError, boolean>;

    const checkAllProducts = (productIds: readonly ProductId[]): Effect.Effect<ProductRepository, DbError, readonly boolean[]> =>
      Effect.forEach(productIds, (id) => checkAvailability(id), { concurrency: "inherit" }); // Or specify concurrency

    // Alternative (less idiomatic for simple mapping):
    // const checkAllProductsManual = (productIds: readonly ProductId[]): Effect.Effect<ProductRepository, DbError, readonly boolean[]> =>
    //   ReadonlyArray.reduce(productIds, Effect.succeed([]) as Effect.Effect<...>, (accEffect, id) =>
    //     Effect.zipWith(accEffect, checkAvailability(id), (results, current) => [...results, current])
    //   );
    ```
*   **Example 2 (Avoiding Blocking):**
    ```typescript
    import * as FS from "@effect/platform/FileSystem";
    import { Effect } from "effect";

    // Good: Uses Effect wrapper around Node's async fs
    const readFileContent = (path: string): Effect.Effect<FileSystem, FileSystem.FileSystemError, string> =>
      Effect.flatMap(FileSystem, fs => fs.readFileString(path, "utf-8"));

    // Bad: Uses Node's synchronous API, blocking the event loop (EN Ch 1)
    // import * as fs from "node:fs";
    // const readFileContentSync = (path: string): string => {
    //   return fs.readFileSync(path, "utf-8"); // Blocks! Avoid!
    // }
    ```

**6. Type Design**

*   **Valid States Only (ET Item 29):** Use ADTs (discriminated unions) to make illegal states unrepresentable.
*   **Explicit Absence/Failure (ET Item 33, 36, Haskell Ch 3):** Use `Option<A>` and `Either<E, A>` instead of `null` / `undefined` / magic values within your domain types. Push `null` handling to boundaries.
*   **Unions of Interfaces (ET Item 34):** Prefer `TypeA | TypeB` over `interface WithUnion { kind: 'A' | 'B'; ... }` when properties differ significantly between variants.
*   **Precise Primitives (ET Item 35):** Use literal types, unions of literals, branded types instead of `string` or `number` where applicable.
*   **Minimize Optional Properties (ET Item 37):** Question every optional (`?`) property. Can the type be split? Can a default be provided reliably at creation? Can it be represented by `Option<T>`?
*   **Unify Types (ET Item 39):** Avoid creating slightly different types for the same underlying concept (e.g., `UserDbRecord` vs `UserDto`). Define one canonical type and transform at boundaries.

*   **Example 1 (ADT for Request State):**
    ```typescript
    type RequestState<A> =
      | { readonly _tag: "Idle" }
      | { readonly _tag: "Loading" }
      | { readonly _tag: "Success"; readonly data: A }
      | { readonly _tag: "Failure"; readonly error: Error };
    ```
*   **Example 2 (Precise Primitives & Option):**
    ```typescript
    import { Option } from "effect";

    type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
    interface Order {
      readonly id: Brand.Branded<string, "OrderId">;
      readonly status: OrderStatus;
      // Use Option for truly optional data, not undefined?
      readonly trackingNumber: Option.Option<string>;
    }
    ```

**7. Structural Practices & Common Design Patterns**

*(Maintain existing Hexagonal structure guidelines)*

*   **Algebraic Data Types (ADTs):** Use discriminated unions extensively to model data structures with distinct cases (Haskell Ch 3).
*   **Immutability:** Ensure all data structures passed between layers or functions are treated as immutable.
*   **Record Types for Sync (ET Item 61):** Use `Record<keyof T, ...>` to enforce that related objects (like props and update checks) stay synchronized.

*   **Example 1 (ADT Usage):**
    ```typescript
    const handleState = (state: RequestState<string>) => {
      switch (state._tag) {
        case "Idle": return "Please initiate a request.";
        case "Loading": return "Loading...";
        case "Success": return `Data: ${state.data}`;
        case "Failure": return `Error: ${state.error.message}`;
      }
    }
    ```
*   **Example 2 (Record for Configuration):**
    ```typescript
    type Feature = "newSearch" | "betaDashboard";
    const FeatureFlags: Record<Feature, boolean> = {
      newSearch: true,
      betaDashboard: false,
      // Compile error if a Feature is missing
    }
    ```

**8. How to Write New Components**

*(Maintain existing Hexagonal guidelines)*

**9. How to Test**

*   **Types vs. Behavior (ET Item 77):** Test *behavior* with unit/integration tests. Rely on `tsc` for *type* correctness. Don't write unit tests that merely check types the compiler already guarantees.
*   **Test Types Explicitly (ET Item 55):** Use `@ts-expect-error` or `expect-type` for complex generics or type utilities where type behavior itself needs verification.
*   *(Maintain existing guidelines)*

*   **Example 1 (Testing Type Correctness - Rely on TSC):**
    ```typescript
    // In a test for a function `formatDate(date: Date): string`

    // Good: Test behavior
    expect(formatDate(new Date(2024, 0, 1))).toBe("2024-01-01");

    // Bad: Redundant type check
    // const result = formatDate(new Date());
    // expect(typeof result).toBe("string"); // TSC already ensures this
    ```
*   **Example 2 (Testing a Generic Type Helper):**
    ```typescript
    import { type Equals, expectTypeOf } from "expect-type";
    import { type Option } from "effect";

    // Assuming a custom generic type: MaybeToOption<T>
    type MaybeToOption<T> = T extends null | undefined ? Option.None : Option.Some<T>;

    expectTypeOf<MaybeToOption<number>>().toEqualTypeOf<Option.Option<number>>();
    expectTypeOf<MaybeToOption<string | null>>().toEqualTypeOf<Option.Option<string>>();
    expectTypeOf<MaybeToOption<undefined>>().toEqualTypeOf<Option.Option<never>>(); // Option.None
    ```

10. Build & Dependencies

    Use devDependencies: Place typescript and all @types/* packages in devDependencies (ET Item 65). Production builds should only need dependencies.

    package-lock.json: Commit this file to ensure reproducible builds across all environments.

    NPM Scripts: Use npm run ... scripts for common tasks like build, test, lint, check-types (EN Ch 5). Use pre and post scripts for automation (e.g., pretest to lint).

    Example 1 (package.json snippet):

          
    {
      "scripts": {
        "build": "tsc --build",
        "test": "node --test",
        "lint": "eslint .",
        "check-types": "tsc --noEmit",
        "pretest": "npm run lint && npm run check-types"
      },
      "dependencies": {
        "@effect/platform-node": "...",
        "effect": "..."
      },
      "devDependencies": {
        "@types/node": "...",
        "@typescript-eslint/eslint-plugin": "...",
        "eslint": "...",
        "typescript": "...",
        "vitest": "..." // Or other test runner
      }
    }

        

    IGNORE_WHEN_COPYING_START

Use code with caution. Json
IGNORE_WHEN_COPYING_END

Example 2 (Simple Build Script):

      
// package.json scripts section
 "scripts": {
   "clean": "rm -rf dist",
   "compile": "tsc --build",
   "build": "npm run clean && npm run compile"
 }

    

IGNORE_WHEN_COPYING_START

    Use code with caution. Json
    IGNORE_WHEN_COPYING_END

11. Debugging

    Enable Source Maps: Always compile with source maps ("sourceMap": true) enabled in tsconfig.json to debug the original TypeScript code (ET Item 73).

    Node Inspector: Use node --inspect or node --inspect-brk and connect via Chrome DevTools (chrome://inspect) or editor integrations (EN Ch 4). Step through the TypeScript code, not the generated JS.

    Logging: Use Console.log (from effect) for effectful logging. Avoid excessive or uncommented logging.

    Environment Variables: Use NODE_DEBUG=module_name to get low-level debugging info from Node.js core modules if needed (EN Ch 2).

    Example 1 (Running with Inspector):

          
    # Compile with source maps first
    npm run build

    # Run with inspector, break at start
    node --inspect-brk dist/main.js
    # Then connect via chrome://inspect


Example 2 (Using NODE_DEBUG):

      
# Get debug info from Node's http module
NODE_DEBUG=http node dist/server.js


12. Review and Evolution

This specification is a living document. It should be reviewed periodically by the team and updated based on project experiences, new insights from readings, and the evolution of TypeScript, EffectTS, and Node.js. Proposed changes should be discussed within the team.

Okay, team, let's formalize our approach to using EffectTS to ensure we build robust, maintainable, and understandable applications. This coding standard update integrates best practices inspired by functional programming, Effective TypeScript, and Efficient Node.js, specifically highlighting how EffectTS empowers these practices.

---

This addendum details how we leverage the EffectTS ecosystem to implement the core principles outlined in our main Coding Practices Specification (v1.2). The goal is to provide concrete guidance on using EffectTS features effectively.

**2. Core Principles & EffectTS Enablement**

*   **Functional First & Immutability:**
    *   **EffectTS Enablement:** *Always* use Effect's immutable data structures (`Chunk`, `HashMap`, `HashSet`, `SortedSet`, `List`) for collections instead of native mutable arrays or objects where appropriate. Use `Data.struct`, `Data.tuple`, `Data.array` for value-based equality and hashing on simple structures. Leverage `readonly` extensively in type definitions.

*   **Type Safety & Soundness:**
    *   **EffectTS Enablement:** EffectTS's design heavily relies on TypeScript's type system. Its core `Effect<A, E, R>` type explicitly tracks success (`A`), error (`E`), and requirements (`R`), enhancing static analysis. Use `@effect/schema` for robust runtime validation at boundaries, mitigating unsoundness (ET Item 48).

*   **Algebraic Data Types (ADTs):**
    *   **EffectTS Enablement:** Model domain states and variations using Effect's `Option<A>` (for optionality, replacing `null`/`undefined`) and `Either<E, A>` (for simple success/failure). Use `Data.TaggedEnum` or `Schema.Union` with `Schema.TaggedStruct` or `Schema.Class` variants for defining more complex discriminated unions. Utilize `Match` for type-safe pattern matching on these ADTs.

*   **Explicit Error & Absence Handling:**
    *   **EffectTS Enablement:** This is central to Effect.
        *   Use the `E` type parameter in `Effect<A, E, R>` for *expected*, recoverable domain errors. Define custom error types (often extending `Data.TaggedError`) for clarity.
        *   Use `Effect.Option<A>` for optional return values within the `A` channel, *never* return `null` or `undefined` directly from effectful computations.
        *   Handle errors explicitly using `Effect.catchTag`, `Effect.catchTags`, `Effect.catchAll`, `Effect.orElse`, etc.
        *   Use `Effect.die` for *unexpected*, unrecoverable errors (defects). Reserve recovery from defects (`catchAllCause`, `sandbox`) for the outermost application boundaries or specific integration points (e.g., plugin systems).

*   **Hexagonal Architecture:**
    *   **EffectTS Enablement:** EffectTS `Layer`, `Context`, and `Tag` provide the mechanism for dependency injection, perfectly aligning with Hexagonal Architecture. Define Ports as `Tag`s (interfaces) and Adapters as `Layer`s that implement those `Tag`s.

*   **Effect System:**
    *   **EffectTS Enablement:** This *is* EffectTS. Model *all* side effects (I/O, randomness, time, errors, state management) using `Effect`. Use provided abstractions like `@effect/platform` (`FileSystem`, `Http`, `Command`, `Terminal`, `KeyValueStore`) where available.

*   **Composition:**
    *   **EffectTS Enablement:** Use `Effect.flatMap`, `Effect.map`, `Effect.zip`, `Effect.all`, `Effect.forEach`, and especially `Effect.gen` (for do-notation style) to compose effects declaratively. Use `pipe` for chaining operations on Effect values and data types.

*   **Explicit Dependencies:**
    *   **EffectTS Enablement:** Use `Context.Tag` to define service interfaces (Ports). Use `Layer` to define service implementations (Adapters) and their dependencies. Use `Effect.provide` or `Layer.provide` to wire dependencies.

*   **Node.js Efficiency:**
    *   **EffectTS Enablement:** Use `@effect/platform-node` which provides Effect-native, non-blocking wrappers for Node.js APIs (e.g., `FileSystem`, `Http`). Use `Stream` for handling large datasets or continuous data flows efficiently. Use `Effect.fork` for concurrency and consider `@effect/platform` Workers for CPU-bound tasks if necessary (though often Effect's efficient concurrency model suffices).

*   **Testability:**
    *   **EffectTS Enablement:** Test pure logic directly. Test effects by providing mock `Layer`s or service implementations using `Effect.provide*`. Use `TestContext`, `TestClock`, `TestConfigProvider`, `TestConsole`, `TestRandom` for fine-grained control over default services during tests.

**3. Specific EffectTS Practices**

*   **Prefer `Effect.gen` for Readability:** For sequences of operations (more than 2-3 steps), prefer `Effect.gen` over deeply nested `Effect.flatMap` calls or long `pipe` chains for improved readability, mimicking `async/await`.
*   **Use Tagged Errors:** Define custom errors extending `Data.TaggedError` or `Schema.TaggedError`. This enables precise error handling with `Effect.catchTag` and `Effect.catchTags`.
    ```typescript
    import { Data, Effect } from "effect";

    class UserNotFoundError extends Data.TaggedError("UserNotFound")<{ userId: string }> {}
    class DatabaseError extends Data.TaggedError("DatabaseError")<{ cause: unknown }> {}

    const getUser = (id: string): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      Effect.fail(new UserNotFoundError({ userId: id })); // Example

    getUser("123").pipe(
      Effect.catchTag("UserNotFound", (e) => Effect.log(`User ${e.userId} not found.`)),
      Effect.catchTag("DatabaseError", (e) => Effect.logError(`DB Error: ${e.cause}`))
    );
    ```
*   **Leverage `@effect/schema`:** Use `Schema` for:
    *   Validating data at application boundaries (API requests/responses, config files, database results).
    *   Defining precise domain types, including refinements and branded types (`Schema.brand`).
    *   Automatic derivation of `Equivalence` (`Schema.equivalence`) and potentially other type class instances.
*   **Use `Effect.Option` and `Effect.Either`:** Avoid `null`/`undefined` within effect computations. Use `Option` for potential absence and `Either` for simple success/failure values *within* the success channel `A` if needed, but prefer the `E` channel for primary error handling.
*   **Manage Resources with `Scope`:** Use `Effect.acquireRelease` or `Stream.acquireRelease` for managing resources that need explicit cleanup (e.g., file handles, database connections). Use `Effect.scoped` to provide the necessary scope. Finalizers (`Effect.ensuring`, `Effect.addFinalizer`) ensure cleanup even on interruption.
*   **Concurrency Control:** Be explicit about concurrency. Use `Effect.all`, `Effect.forEach` with concurrency options (`{ concurrency: number | "unbounded" | "inherit" }`). Use `Effect.fork` consciously. Leverage structured concurrency (fibers are supervised by default).
*   **Configuration:** Use `@effect/io/Config` and `ConfigProvider` for type-safe configuration loading, including handling secrets (`Config.redacted`).
*   **Logging:** Use `Effect.log*` functions (`log`, `logInfo`, `logError`, etc.) for contextual logging integrated with Fibers and Spans (if tracing is enabled). Configure log levels via `Logger.minimumLogLevel`.
*   **State Management:** Prefer `Ref` or `SynchronizedRef` for managing mutable state within effects over external mutable variables.
*   **Batching & Caching:** Utilize `Request` / `RequestResolver` for automatic batching and caching of requests to external services where applicable. Use `Effect.cached` or `Cache` for memoizing effect results.

**4. Example: Fetching and Processing User Data**

```typescript
import { Effect, Context, Layer, Data, Schema, Option, Console } from "effect";
import { FileSystem } from "@effect/platform/FileSystem"; // Example platform usage
import { HttpClient } from "@effect/platform/HttpClient"; // Example platform usage

// -- Domain --
class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.OptionFromNullOr(Schema.String) // Handles potential null from DB/API
}) {}
type UserId = number;

// -- Errors --
class ApiError extends Data.TaggedError("ApiError")<{ status: number; body: string }> {}
class DbError extends Data.TaggedError("DbError")<{ cause: unknown }> {}
class FileError extends Data.TaggedError("FileError")<{ cause: unknown }> {}

// -- Ports (Tags) --
class UserRepo extends Context.Tag("UserRepo")<UserRepo, {
  readonly findById: (id: UserId) => Effect.Effect<Option.Option<User>, DbError>;
}>() {}

class UserNotifier extends Context.Tag("UserNotifier")<UserNotifier, {
  readonly notify: (user: User, message: string) => Effect.Effect<void, never>; // Assume notify never fails expectedly
}>() {}

// -- Core Logic --
const processUser = (id: UserId): Effect.Effect<void, ApiError | DbError | FileError, UserRepo | UserNotifier | FileSystem> =>
  Effect.gen(function* () {
    const repo = yield* UserRepo;
    const notifier = yield* UserNotifier;
    const fs = yield* FileSystem; // Access platform service

    const maybeUser = yield* repo.findById(id).pipe(
      Effect.tapErrorTag("DbError", (e) => Effect.logError("Database failed", e.cause))
    );

    if (Option.isNone(maybeUser)) {
      yield* Effect.logWarning(`User ${id} not found.`);
      return;
    }

    const user = maybeUser.value;
    yield* notifier.notify(user, "Processing your request...");
    yield* Effect.logInfo(`Processing user ${user.name}`);

    // Example of using another platform feature
    const content = yield* fs.readFileString(`/path/to/user/${id}.txt`, "utf-8").pipe(
      Effect.catchTag("SystemError", (e) => new FileError({ cause: e })) // Map platform error
    );
    yield* Effect.logDebug(`User file content length: ${content.length}`);

    // ... further processing ...
    yield* Effect.logInfo(`Finished processing user ${user.name}`);
  });

// -- Adapters (Layers) -- (Implementations would go here)
// const UserRepoLive: Layer.Layer<UserRepo, never, DbConnectionPool>;
// const UserNotifierLive: Layer.Layer<UserNotifier, never, EmailService>;
// const PlatformLive: Layer.Layer<FileSystem | HttpClient, ...>; // from @effect/platform-node

// -- Composition (Example) --
// const AppLayer = Layer.provideMerge(UserRepoLive, UserNotifierLive)
//   .pipe(Layer.provideMerge(PlatformLive), ... provide DbConnectionPool, EmailService ...);
// const runnable = Effect.provide(processUser(123), AppLayer);
// Effect.runPromise(runnable);
```

**5. Conclusion**

EffectTS provides powerful tools to write safer, more composable, and easier-to-test applications. By adhering to these practices, we aim to harness its full potential, leading to a higher quality codebase. Remember to use the EffectTS documentation and community resources when unsure. This standard is a guideline; thoughtful deviation with team consensus is permitted when justified.

Okay team, building on our previous coding standard, here's a deeper dive into *how* EffectTS works under the hood (at a conceptual level) and a collection of practical usage examples to solidify understanding.

---

This addendum aims to provide a clearer understanding of the core mechanisms within EffectTS and illustrate common patterns with practical examples. This should help demystify *how* Effect achieves its benefits and provide concrete usage patterns beyond the foundational principles.

**2. How EffectTS Works: Core Concepts**

EffectTS isn't magic, but it uses some clever abstractions. Understanding them helps in writing more effective code.

*   **The `Effect<A, E, R>` Data Type: A Blueprint**
    *   **What it is:** An `Effect` value is *not* an action being performed, nor is it like a `Promise` that has already started. It's an **immutable description** or a **blueprint** of a computation.
    *   **Laziness:** Creating an `Effect` does nothing by itself. The computation it describes only happens when it's explicitly run.
    *   **Composition:** Functions like `Effect.map`, `Effect.flatMap`, `Effect.zip`, etc., don't *run* effects; they combine existing blueprints to create *new*, more complex blueprints.
    *   **Analogy:** Think of an `Effect` like a detailed recipe. The recipe itself doesn't cook the food; it just describes the steps.

*   **The Effect Runtime System: The Executor**
    *   **What it is:** This is the engine that takes an `Effect` blueprint (the "recipe") and executes the described operations (does the "cooking").
    *   **Execution:** Functions like `Effect.runPromise`, `Effect.runSync`, `Effect.runFork`, and platform-specific `runMain` variants invoke the runtime.
    *   **Fibers:** The runtime executes effects on lightweight virtual threads called **Fibers**. These are managed by EffectTS, not the OS or Node.js directly. They allow for highly efficient concurrency and safe interruption.
    *   **Responsibilities:** The runtime handles:
        *   Executing the steps described by the `Effect`.
        *   Managing the lifecycle of Fibers (creation, scheduling, interruption, cleanup).
        *   Handling errors (`E`) and defects (unexpected errors).
        *   Providing the required context/services (`R`).
        *   Ensuring resource safety (`Scope` finalization).

*   **Key Internal Mechanisms (Conceptual View)**

    *   **Fibers (Lightweight Concurrency):**
        *   Unlike OS threads or Node.js Worker Threads, Fibers are extremely cheap to create and manage. An application can potentially run hundreds of thousands concurrently.
        *   They use **cooperative multitasking**. A Fiber runs until it completes, fails, is interrupted, or explicitly *yields* control back to the Effect scheduler (e.g., during `Effect.sleep` or asynchronous operations). This prevents CPU monopolization and keeps the Node.js event loop responsive.
        *   EffectTS implements **Structured Concurrency**. When an `Effect` forks child Fibers (e.g., via `Effect.fork`, `Effect.all({ concurrency: > 1 })`), the parent Fiber supervises them. If the parent terminates (succeeds, fails, or is interrupted), it ensures all its children are properly interrupted and cleaned up. This prevents resource leaks and zombie processes/tasks.

    *   **Error Handling (`Cause`):**
        *   While the `E` in `Effect<A, E, R>` tracks *expected* failures, Effect tracks *all* termination reasons internally using the `Cause` data type.
        *   A `Cause<E>` can represent:
            *   `Fail(e: E)`: An expected failure with value `e`.
            *   `Die(defect: unknown)`: An unexpected error/defect (e.g., an uncaught exception, logic error).
            *   `Interrupt(fiberId)`: Termination due to interruption.
            *   `Sequential(left, right)`: Two causes that happened sequentially (e.g., failure in `try` then failure in `finally`).
            *   `Parallel(left, right)`: Two causes that happened concurrently.
        *   This rich structure allows Effect to provide detailed error reporting and enables operators like `catchAllCause` or `sandbox` to handle *any* termination reason, not just expected `E` failures.

    *   **Context & Layers (`Context<R>` & `Layer<A, E, RIn>`):**
        *   `Context<R>`: A type-safe map holding service implementations. It's essentially `Map<Tag, Service>`. An `Effect` receives the `Context` it needs (`R`) to run.
        *   `Tag`: A unique identifier (usually created via `Context.Tag`) representing a service interface. Used as the key in the `Context`.
        *   `Layer<A, E, RIn>`: A blueprint for creating a part (`A`) of the final `Context`. It describes *how* to build a service `A`, specifying its own dependencies (`RIn`) and potential construction errors (`E`).
        *   **Dependency Graph Resolution:** When you provide a `Layer` to an `Effect` (via `Effect.provide` or `Layer.provide`), Effect analyzes the dependency graph. It figures out which services are needed, in what order they must be built, and constructs the required `Context`.
        *   **Memoization:** By default, Layers are memoized based on reference equality. If the *exact same* `Layer` instance is required multiple times in the dependency graph, its construction effect runs only once, and the resulting service instance is shared. Use `Layer.fresh` to opt-out of this sharing.

    *   **Resource Management (`Scope`):**
        *   A `Scope` represents the lifetime of a resource or a group of resources.
        *   `Effect.acquireRelease(acquire, release)` registers a `release` finalizer effect within the current `Scope`.
        *   When a `Scope` is closed (either normally on completion/success, or prematurely due to failure/interruption), it guarantees that all registered finalizers are executed in the reverse order of acquisition.
        *   `Effect.scoped(effectWithScope)` creates a local scope, runs the effect, and ensures the scope is closed afterward. `Layer`s implicitly manage scopes for the services they build. This mechanism ensures resources like file handles, network connections, etc., are always cleaned up.

**3. Practical Usage Examples**

*   **Example 1: Basic Effect Creation**
    ```typescript
    import { Effect, Console } from "effect";

    // Effect succeeding with a value
    const succeedWithValue = Effect.succeed(42);

    // Effect failing with a specific error
    class MyError extends Data.TaggedError("MyError")<{ reason: string }> {}
    const failWithError = Effect.fail(new MyError({ reason: "Something went wrong" }));

    // Effect from a synchronous computation (that doesn't throw)
    const fromSync = Effect.sync(() => {
      console.log("Side effect!");
      return Date.now();
    });

    // Effect from a synchronous computation (that might throw)
    const fromTry = Effect.try(() => JSON.parse("{ invalid json")); // Error type: UnknownException

    // Effect from a Promise (that is expected to resolve)
    const fromPromise = Effect.promise(() => Promise.resolve("Data from promise"));

    // Effect from a Promise (that might reject)
    const fromTryPromise = Effect.tryPromise({
      try: () => fetch("/api/data").then(res => res.ok ? res.json() : Promise.reject(res.statusText)),
      catch: (e) => new ApiError({ status: 500, body: String(e) }) // Map rejection to specific error
    });

    Effect.runPromise(fromSync).then(ts => console.log(`Timestamp: ${ts}`));
    ```

*   **Example 2: Composition with `Effect.gen`**
    ```typescript
    import { Effect, Console, Random } from "effect";

    const step1 = Effect.succeed(10);
    const step2 = (input: number) => Effect.delay(Effect.succeed(input * 2), "50 millis");
    const step3 = (input: number) => Random.nextIntBetween(0, input);

    const program = Effect.gen(function* () {
      yield* Console.log("Starting calculation...");
      const initial = yield* step1;
      const doubled = yield* step2(initial);
      const final = yield* step3(doubled);
      yield* Console.log(`Final result: ${final}`);
      return final;
    });

    Effect.runPromise(program).then(result => console.log(`Program returned: ${result}`));
    // Output might be:
    // Starting calculation...
    // Final result: 15
    // Program returned: 15
    ```

*   **Example 3: Error Handling**
    ```typescript
    import { Effect, Either, Data, Console } from "effect";

    class FileReadError extends Data.TaggedError("FileReadError")<{ path: string }> {}
    class NetworkError extends Data.TaggedError("NetworkError")<{ url: string }> {}

    const readFile = (path: string): Effect.Effect<string, FileReadError> =>
      Effect.succeed(`Content of ${path}`).pipe(Effect.delay("10 millis")); // Simulate read

    const callApi = (url: string): Effect.Effect<string, NetworkError> =>
      Effect.fail(new NetworkError({ url }));

    const program: Effect.Effect<string, FileReadError | NetworkError> = readFile("config.txt");
    const program2: Effect.Effect<string, FileReadError | NetworkError> = callApi("/users");

    // Catch specific error
    const handledFileRead = program.pipe(
      Effect.catchTag("FileReadError", (e) =>
        Effect.succeed(`Default content used because ${e.path} failed`)
      )
    );
    // handledFileRead: Effect<string, NetworkError>

    // Provide a fallback
    const withFallback = program2.pipe(
      Effect.orElse(() => Effect.succeed("Fallback API data"))
    );
    // withFallback: Effect<string, FileReadError> // Original error is gone

    // Catch all errors and log them
    const loggedErrors = Effect.all([program, program2], { concurrency: "unbounded" }).pipe(
      Effect.catchAll((e) => Console.log(`Caught error: ${e._tag}`))
    );
    // loggedErrors: Effect<void, never>

    Effect.runPromise(handledFileRead).then(console.log);
    Effect.runPromise(withFallback).then(console.log);
    Effect.runPromise(loggedErrors);
    ```

*   **Example 4: Dependency Injection (Service, Tag, Layer, Provide)**
    ```typescript
    import { Effect, Context, Layer, Console } from "effect";

    // 1. Define Service Interface & Tag
    interface Logger {
      readonly log: (message: string) => Effect.Effect<void>;
    }
    const Logger = Context.Tag<Logger>("MyLogger");

    // 2. Define Program Logic using the Service
    const myAppLogic = Effect.gen(function* () {
      const logger = yield* Logger; // Request the Logger service
      yield* logger.log("Application starting");
      // ... do work ...
      yield* logger.log("Application finished");
    });
    // myAppLogic: Effect<void, never, Logger>

    // 3. Implement the Service (Create a Layer)
    const ConsoleLoggerLive = Layer.succeed(
      Logger, // The Tag we are implementing
      { log: (message) => Console.log(`[INFO] ${message}`) } // The implementation
    );
    // ConsoleLoggerLive: Layer<Logger, never, never>

    // 4. Provide the Layer to the program
    const runnable = Effect.provide(myAppLogic, ConsoleLoggerLive);
    // runnable: Effect<void, never, never>

    Effect.runPromise(runnable);
    // Output:
    // [INFO] Application starting
    // [INFO] Application finished
    ```

*   **Example 5: Concurrency (`Effect.all`, `Effect.fork`, `Fiber.join`, `Effect.race`)**
    ```typescript
    import { Effect, Fiber, Console, Duration } from "effect";

    const task = (name: string, delay: Duration.DurationInput) =>
      Console.log(`Task ${name} starting`).pipe(
        Effect.zipRight(Effect.sleep(delay)),
        Effect.zipRight(Console.log(`Task ${name} finished`)),
        Effect.as(name) // Return task name on success
      );

    // Run concurrently, wait for all
    const runAllConcurrent = Effect.all(
      [task("A", "100 millis"), task("B", "50 millis"), task("C", "150 millis")],
      { concurrency: "unbounded" } // Run all at once
    );

    // Fork a background task, continue, then wait for it
    const runInBackground = Effect.gen(function* () {
      const fiber = yield* Effect.fork(task("BG", "200 millis")); // Start in background
      yield* Console.log("Main fiber continues...");
      yield* Effect.sleep("50 millis");
      yield* Console.log("Main fiber waiting for BG task...");
      const result = yield* Fiber.join(fiber); // Wait for the background task
      yield* Console.log(`Background task finished with: ${result}`);
    });

    // Race two tasks, take the winner
    const raceTasks = Effect.race(task("Fast", "50 millis"), task("Slow", "200 millis"));

    Effect.runPromise(runAllConcurrent).then(results => console.log(`All finished: ${results}`));
    Effect.runPromise(runInBackground);
    Effect.runPromise(raceTasks).then(winner => console.log(`Race winner: ${winner}`));
    ```

*   **Example 6: Resource Management (`Effect.acquireRelease`, `Effect.scoped`)**
    ```typescript
    import { Effect, Console, Scope } from "effect";

    // Simulate acquiring/releasing a resource (e.g., file handle)
    const acquire = Console.log("Resource Acquired").pipe(Effect.as({ id: Math.random() }));
    const release = (res: { id: number }) => Console.log(`Resource ${res.id} Released`);

    const resourceEffect = Effect.acquireRelease(acquire, release);
    // resourceEffect: Effect<{ id: number }, never, Scope>

    const program = Effect.gen(function* () {
      yield* Console.log("Using resource...");
      const resource = yield* resourceEffect;
      yield* Console.log(`Processing with resource ${resource.id}`);
      yield* Effect.sleep("50 millis");
      // Scope will ensure release is called even if this fails/is interrupted
      yield* Console.log("Finished using resource.");
    });

    // Provide the scope automatically
    const runnable = Effect.scoped(program);
    // runnable: Effect<void, never, never>

    Effect.runPromise(runnable);
    // Output:
    // Using resource...
    // Resource Acquired
    // Processing with resource 0.1234...
    // Finished using resource.
    // Resource 0.1234... Released
    ```

*   **Example 7: State Management (`Ref`)**
    ```typescript
    import { Effect, Ref, Console } from "effect";

    const program = Effect.gen(function* () {
      const counterRef = yield* Ref.make(0); // Create Ref with initial value 0

      // Update the Ref
      yield* Ref.update(counterRef, (n) => n + 1);
      yield* Ref.update(counterRef, (n) => n + 1);

      // Get the current value
      const currentValue = yield* Ref.get(counterRef);
      yield* Console.log(`Counter value: ${currentValue}`); // Output: 2

      // Modify and get old/new values
      const [oldValue, newValue] = yield* Ref.modify(counterRef, (n) => [n, n * 2]);
      yield* Console.log(`Modified: ${oldValue} -> ${newValue}`); // Output: 2 -> 4

      const finalValue = yield* Ref.get(counterRef);
      yield* Console.log(`Final value: ${finalValue}`); // Output: 4
    });

    Effect.runPromise(program);
    ```

*   **Example 8: Platform Integration (`@effect/platform-node`)**
    ```typescript
    import { FileSystem } from "@effect/platform/FileSystem";
    import { Effect, Console } from "effect";
    import { NodeContext, NodeRuntime } from "@effect/platform-node"; // Node.js specific layer

    const program = Effect.gen(function* () {
      const fs = yield* FileSystem; // Request the FileSystem service
      try {
        // Use the platform-specific implementation
        const content = yield* fs.readFileString("package.json", "utf-8");
        yield* Console.log(`package.json has ${content.length} characters.`);
      } catch (error) {
        yield* Console.error("Failed to read file", error);
      }
    });

    // Provide the Node.js context layer and run
    const runnable = Effect.provide(program, NodeContext.layer);
    NodeRuntime.runMain(runnable); // Use platform-specific runner
    ```

*   **Example 9: Schema Validation**
    ```typescript
    import { Schema, Effect, Console } from "effect";

    const Person = Schema.Struct({
      name: Schema.String.pipe(Schema.minLength(1)),
      age: Schema.Number.pipe(Schema.int(), Schema.positive())
    });

    const validate = Schema.decodeUnknownSync(Person, { errors: "all" }); // Throws on error

    const processData = (data: unknown) => Effect.gen(function*() {
      try {
        const person = validate(data); // Use the validator
        yield* Console.log(`Valid person: ${person.name}, Age: ${person.age}`);
      } catch (parseError) {
        // Error is a ParseError from Schema
        yield* Console.error("Invalid data:", ParseResult.formatError(parseError));
      }
    });

    Effect.runPromise(processData({ name: "Alice", age: 30 }));
    Effect.runPromise(processData({ name: "", age: -5 })); // Will log errors
    ```

**4. Conclusion**

EffectTS provides a powerful, composable, and type-safe way to build applications. Understanding its core concepts – the lazy `Effect` data type, the runtime executor, Fibers, `Cause`, `Context`/`Layer`, and `Scope` – allows you to leverage its features effectively. Use these examples as starting points for common patterns. Remember to consult the official documentation for specific API details and explore the wider Effect ecosystem (`@effect/platform`, `@effect/schema`, etc.) as needed.