# Browser SQL Requirements and Acceptance Scenarios

This document is the Phase B planning synthesis for the Browser SQL migration.

It is **not** a new product/spec authority and contains no live progress. It consolidates existing authorities into a traceable engineering planning view.

Authoritative sources remain:

- `../../../../../../../docs/project/decisions/D-025.md` — Browser-only architecture boundary;
- `../../../../../../../docs/product/live-sql-query-execution.md` — live user-defined SQL product requirement;
- `../../../../../../../docs/product/live-opportunity-discovery.md` — broader live-analysis/data capabilities;
- `browser-sql-current-state-audit.md` — verified inherited baseline and migration evidence;
- `../STATUS.json` — live planning pointer.

Use these classification labels:

~~~text
Fixed Decision      = already decided for this planning cycle
Design Requirement  = target behavior/capability that design must satisfy
Acceptance Behavior = observable end-to-end proof of a requirement
Assumption          = useful planning premise that is not a frozen contract
Unknown             = intentionally deferred to later planning/research
~~~

## 1. Fixed decisions

| ID | Decision | Source |
|---|---|---|
| FD-01 | The active V2 analytical target is Browser-only SQL inside the authenticated browser process. | D-025 |
| FD-02 | A real SQL engine is required; changing analytical logic should normally mean changing SQL, not collector/application code. | D-025 + live-sql-query-execution |
| FD-03 | IndexedDB is not the target analytical query engine. | D-025 + live-sql-query-execution |
| FD-04 | localhost / Node / .NET / native DuckDB are not active alternatives, benchmark tracks or backlog items in this planning cycle. | D-025 |
| FD-05 | Reopening the process boundary later requires a new explicit architecture decision based on evidence that Browser SQL cannot satisfy a required capability. | D-025 |
| FD-06 | Provider authentication/session handling remains in the browser; no second authentication path is introduced for SQL analytics. | D-025 + live-sql-query-execution |
| FD-07 | V1 remains frozen as a verified reference. | D-025 + current-state audit |
| FD-08 | No Browser SQL implementation begins until the planning project reaches implementation handoff. | ROADMAP |

## 2. Design requirements

### 2.1 Collection and integrity

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-01 | Preserve authenticated browser collection. | Proven baseline; current-state audit. |
| DR-02 | Preserve a dynamic security universe; universe size must never be hardcoded. | Inherited contract + live-opportunity-discovery. |
| DR-03 | Canonical security identity remains a string derived from `PaperId` or `Key`. | Inherited contract. |
| DR-04 | A collection cycle must be proven complete before it can become visible as successful market state. | Inherited recorder/persistence contract. |
| DR-05 | Provider/API/validation/storage failure must not expose a partial successful cycle. | Inherited atomicity contract. |
| DR-06 | Queries must see only coherently committed market data, never a half-written successful cycle. | live-sql-query-execution + inherited atomicity. |
| DR-07 | Full relevant raw provider data must be retained so future SQL can use fields not anticipated at collection time. | live SQL + opportunity discovery. |
| DR-08 | Preserve semantic distinction between `null`, `0`, empty string and missing/undefined source data. | Inherited correctness contract. |
| DR-09 | Unknown provider field semantics must not be guessed. | Inherited correctness contract. |

### 2.2 SQL capability

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-10 | The user can provide/replace active SQL without rebuilding or editing collector/application logic. | Core product behavior. |
| DR-11 | SQL capability must support the analytical constructs needed by the product, including `SELECT`, `JOIN`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`, window functions, historical/time-window conditions and cross-security ranking. | live-sql-query-execution. |
| DR-12 | The exact analytical SQL is not a contract and may change frequently. | Product requirement. |
| DR-13 | SQL executes repeatedly at a user-configurable interval. | Core product behavior. |
| DR-14 | SQL cadence is conceptually independent from collector cadence. | SQL design direction. |
| DR-15 | A successful SQL execution may return any cardinality from 0 to N rows; zero rows is not an error. | live-sql-query-execution. |
| DR-16 | Query errors are observable and must not corrupt persistent market data. | live-sql-query-execution. |
| DR-17 | Query failure must not silently stop market-data ingestion. | live-sql-query-execution. |
| DR-18 | The design must define deterministic behavior when query runtime exceeds its configured interval. | live-sql-query-execution. |
| DR-19 | Uncontrolled overlapping query executions are not allowed. | SQL design direction. |
| DR-20 | User analytical SQL must have a safe read-only boundary distinct from schema/admin mutation unless a later explicit requirement changes it. | ROADMAP + SQL design direction. |

### 2.3 Query observability and traceability

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-21 | Query execution duration and result row count are observable. | live-sql-query-execution. |
| DR-22 | The runtime must distinguish active SQL identity/version, current execution status/error and latest successful result. | SQL design direction. |
| DR-23 | It must be possible to tell which SQL version produced a result/error. | Required for query traceability. |
| DR-24 | Ingest success/failure and query success/failure remain separately observable; one must not masquerade as the other. | Derived from collector/query failure isolation requirements. |

### 2.4 Historical analytical data

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-25 | Every persisted market snapshot needs stable snapshot identity separate from canonical security identity. | live-opportunity-discovery. |
| DR-26 | Historical data must support repeated live analysis across the current core horizons: 10s, 20s, 30s, 60s, 90s, 120s, 300s and 600s. | live-opportunity-discovery. |
| DR-27 | Historical association uses actual collected snapshots near the intended horizon; exact millisecond equality is not required merely because collector timing jitters. | live-opportunity-discovery. |
| DR-28 | If required historical context does not exist, the relevant reference/derived value is NULL; history must not be fabricated. | live-opportunity-discovery. |
| DR-29 | Historical relationships must be reusable by future SQL rather than repeatedly rediscovered from scratch for every query. The physical representation is not fixed here. | live-opportunity-discovery. |
| DR-30 | Common LAST percentage change over the core horizons must be available as a reusable analytical fact. | live-opportunity-discovery. |
| DR-31 | Deals delta over the core horizons becomes a reusable analytical fact only after the provider cumulative-deal field semantics are verified. | Conditional product requirement. |
| DR-32 | The design may persist cheap, repeatedly useful same-row derived facts such as MID, but must not precompute every arbitrary cross-time combination. | live-opportunity-discovery; exact promoted set remains design work. |
| DR-33 | Full referenced historical rows remain available even when common derived metrics are also persisted. | live-opportunity-discovery. |

### 2.5 Persistence, recovery and security

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-34 | The target must use a persistent browser SQL database rather than an ephemeral query-only engine. | D-025 boundary. |
| DR-35 | Refresh/reopen behavior must preserve already committed authoritative browser data according to the later persistence lifecycle contract. | ROADMAP + inherited recovery expectation. |
| DR-36 | The final target architecture must have one unambiguous market-history authority. | D-025. |
| DR-37 | Repository/runtime artifacts must not contain cookies, session tokens, authorization headers, credentials, account numbers or private session data. | live-sql-query-execution + AGENTS security rule. |

### 2.6 Performance intent

| ID | Requirement | Notes / traceability |
|---|---|---|
| DR-38 | LIVE analysis is the primary use case and the system must sustain mixed ingest + repeated SQL over a trading-session-scale history. | live-opportunity-discovery. |
| DR-39 | The live path needs substantial headroom relative to collection/query cadence; merely finishing just before the next nominal tick is not sufficient design comfort. | product + benchmark planning. |
| DR-40 | Performance conclusions and thresholds must be based on later benchmark evidence, not intuition. | product + benchmark planning. |

## 3. Acceptance behaviors

These scenarios describe what a completed Browser SQL system must eventually prove end to end. They do not prescribe implementation.

### AB-01 — committed-cycle visibility only

Given a previously committed market state and a new collection cycle in progress,

when SQL executes before the new cycle's successful commit,

then SQL sees the previous coherent state only.

After the new cycle commits successfully, later SQL executions may see the new coherent state.

At no point may a successful query observe a half-new/half-old successful cycle.

### AB-02 — failed cycle isolation

Given a provider, validation or storage failure during a new cycle,

when that cycle fails,

then no partial market rows from that attempted cycle become visible as successful current/history data, and scheduled SQL may continue against the last valid committed state.

### AB-03 — arbitrary SQL replacement

Given active SQL version A,

when the user replaces it with SQL version B through the future supported query-definition surface,

then application/collector code is not rebuilt merely to express the new logic, and subsequent executions use B from a deterministic activation boundary.

Execution metadata identifies which version produced each result/error.

### AB-04 — configurable independent cadence

Given continuous market collection and an active SQL interval X,

when X is changed,

then SQL execution cadence changes without redefining collector cadence.

The exact scheduling semantics are later design work, but the two clocks must remain distinct.

### AB-05 — successful zero-row result

Given syntactically and semantically valid SQL whose predicates match no securities,

when it executes successfully,

then the execution is recorded as success with row count 0, not as an error or missing execution.

### AB-06 — query error isolation

Given valid committed market data and an invalid/failing active SQL query,

when the query execution fails,

then the error is observable and attributable to that query version, ingestion continues, persistent market data remains valid, and the previous successful result remains distinguishable from the failed latest execution.

### AB-07 — overrun without uncontrolled overlap

Given a configured SQL interval shorter than a particular query's runtime,

when the query is still running at the next nominal tick,

then the scheduler follows one deterministic documented policy and does not launch uncontrolled overlapping executions.

The exact skip/delay/cancel policy is intentionally deferred.

### AB-08 — refresh/reopen recovery

Given committed browser SQL data and query state allowed by the future persistence contract,

when the page/tab/runtime is refreshed or reopened,

then committed authoritative history remains recoverable and no synthetic market data is invented.

Exact ownership/restart mechanics are deferred to persistence/recovery design.

### AB-09 — raw future-field access

Given a provider field preserved in raw historical data but not originally promoted to a typed/derived analytical column,

when later SQL needs that field,

then the architecture provides a defined way to query/use the preserved source fact without recollecting the historical market session.

The physical raw representation remains open.

### AB-10 — null/zero/empty/missing preservation

Given provider values that distinguish null, numeric zero, empty string and missing source field,

when they are ingested, persisted and queried,

then the system does not silently collapse those source meanings into the same value.

Exact SQL mapping for source-missing remains data-model design work.

### AB-11 — dynamic universe

Given a provider universe whose size or membership differs from a previous cycle/session,

when a complete cycle is collected,

then correctness is based on validated current membership rather than a hardcoded count such as 561.

### AB-12 — historical horizon startup semantics

Given a fresh session with insufficient history for one or more core horizons,

when SQL or derived facts request those horizons,

then existing horizons resolve from real collected snapshots and unavailable horizons remain NULL.

### AB-13 — temporal reuse on historical rows

Given a previously persisted historical snapshot,

when future SQL analyzes that row later,

then the row can still reach the historical context needed for core-horizon comparison without relying only on today's current/latest row.

### AB-14 — cross-security analytical query

Given a coherent committed universe and adequate history,

when SQL performs grouping/ranking/window logic across securities,

then the engine can return a 0..N result set using the same committed analytical authority used by other SQL queries.

### AB-15 — security boundary

Given normal Browser SQL operation,

when repository/runtime assets are inspected,

then provider secrets/session material have not been copied into repository artifacts or a separate local service merely to enable analytics.

## 4. Assumptions that are not frozen contracts

| ID | Assumption | Boundary |
|---|---|---|
| AS-01 | The currently observed provider universe is approximately 561 securities. | Capacity-planning reference only; never a schema/correctness invariant. |
| AS-02 | Collection around ~5 seconds is a useful representative planning workload. | Exact collector cadence remains configuration. |
| AS-03 | Multi-million snapshot rows per trading day are a realistic scale to plan/benchmark. | Dataset sizing will be verified later. |
| AS-04 | The existing Recorder's complete validated-cycle handoff is likely reusable while persistence is replaced. | Inference from current audit; target architecture must validate boundaries rather than preserve private structure by accident. |
| AS-05 | DuckDB-Wasm is the leading browser-engine candidate. | Not selected until official capability research and later verification. |

## 5. Unknowns deliberately deferred

These are not requirement gaps to solve in Phase B; they belong to later roadmap phases.

### Browser/platform constraints

- origin ownership and same-origin implications;
- CSP/CORS/module/Worker/WASM loading constraints in the Leumi environment;
- hidden/background throttling and page/tab lifecycle;
- browser persistence quota/eviction behavior;
- whether one browser SQL Worker/connection owner is required.

### Engine capability

- current DuckDB-Wasm release/API and exact browser support;
- OPFS/persistence suitability;
- transactions/concurrency/locking/isolation;
- cancellation/interruption;
- reopen/recovery semantics;
- JSON/Arrow/bulk-ingest capabilities;
- memory/runtime/storage behavior.

### Target design

- final SQL engine;
- physical relational schema;
- SnapshotId representation;
- raw JSON vs typed columns;
- current/latest representation;
- exact temporal-link representation;
- exact promoted derived-column set;
- DB/Worker ownership;
- result transport/viewer coupling;
- BroadcastChannel role;
- timeout/cancellation/result-size policy;
- query scheduling overrun policy;
- schema migration/versioning;
- retention/export/backup policy;
- migration/import of existing IndexedDB history;
- Bookmarklet/WASM/Worker packaging/delivery.

## 6. Explicit planning non-goals

This Browser SQL planning effort does **not** define or implement:

- the final trading formula;
- entry/exit/order execution logic;
- fixed ranking weights or thresholds;
- a single permanent analytical SQL query;
- DuckDB-Wasm/OPFS runtime code yet;
- benchmark harnesses yet;
- target physical schema yet;
- viewer polish or final SQL editor UX yet;
- localhost/native fallback work;
- implementation Issues before architecture/decomposition phases.

## 7. Phase B completion test

Phase B is complete when later planning can answer:

1. what is fixed vs still open;
2. what observable behaviors the Browser SQL target must satisfy;
3. which current V1/V2 integrity contracts survive the migration;
4. which analytical/data capabilities come from product requirements;
5. which questions must be resolved by browser constraints, official capability research and target architecture rather than guessed now.

This document satisfies that planning role without replacing the original authorities.
