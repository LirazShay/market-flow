# Browser SQL — SQL Execution and Scheduler Contract

This is the Phase H planning artifact for Local History Viewer V2.

It defines analytical SQL identity/versioning, activation, read-only safety, scheduler cadence, no-overlap behavior, execution/result state, failure isolation and result materialization. It does not implement the scheduler.

Durable decision: ../../../../../../../docs/project/decisions/D-029.md

## 1. Product boundary

The runtime has one active analytical SQL version at a time.

Changing analysis normally means:

~~~text
create/activate new SQL version
→ no application rebuild
~~~

Collection cadence and query cadence are independent.

## 2. Logical query entities

Phase H adds these logical runtime entities to the target model:

~~~text
query_definition
query_version
active_query_state
query_execution
~~~

### query_definition

Logical identity for an analytical query/preset:

~~~text
query_id        BIGINT PRIMARY KEY
name            VARCHAR NULL
created_at_ms   BIGINT NOT NULL
~~~

V2 may initially expose only one logical query; the identity keeps versions traceable without requiring a full preset manager.

### query_version

Immutable version of SQL + cadence:

~~~text
query_version_id BIGINT PRIMARY KEY
query_id         BIGINT NOT NULL
version_no       BIGINT NOT NULL
sql_text         VARCHAR NOT NULL
interval_ms      BIGINT NOT NULL
created_at_ms    BIGINT NOT NULL
UNIQUE(query_id, version_no)
~~~

Old versions are never mutated to represent new SQL.

### active_query_state

Singleton logical state:

~~~text
active_query_version_id BIGINT NULL
enabled                 BOOLEAN NOT NULL
activated_at_ms         BIGINT NULL
schedule_anchor_ms      BIGINT NULL
~~~

Exact persistence/recovery of this state is Phase I.

### query_execution

Append-only execution metadata:

~~~text
execution_id             BIGINT PRIMARY KEY
query_version_id         BIGINT NOT NULL
scheduled_for_ms         BIGINT NOT NULL
started_at_ms            BIGINT NOT NULL
finished_at_ms           BIGINT NULL
duration_ms              BIGINT NULL
status                   VARCHAR NOT NULL
row_count                BIGINT NULL
preview_row_count        BIGINT NULL
result_truncated         BOOLEAN NULL
coalesced_tick_count     BIGINT NOT NULL
visible_cycle_id_at_start BIGINT NULL
error_json               JSON NULL
~~~

Exact result-payload persistence is deferred to Viewer/result-delivery and persistence phases.

## 3. Query version activation

Saving changed SQL creates a new immutable query_version.

Activation is atomic:

~~~text
new version + interval
→ safety classification
→ active pointer changes
→ schedule anchor = activation time
~~~

If activation itself fails, the previously active version remains active.

If another query version is already executing, that execution keeps the version captured at its start. The newly activated version applies only to later executions.

Every result/error therefore remains attributable to the exact SQL text/version that produced it.

## 4. Analytical SQL is read-only

User analytical SQL is not schema/admin SQL.

Allowed contract:

~~~text
exactly one analytical query statement
producing a result set
SELECT / WITH / set-operation style query
~~~

Disallowed analytical commands include:

~~~text
INSERT
UPDATE
DELETE
MERGE
CREATE
ALTER
DROP
COPY
ATTACH / DETACH
INSTALL / LOAD
SET / PRAGMA
CALL
transaction control
other DDL/DML/admin commands
~~~

Schema migrations and maintenance SQL run through a separate trusted admin path owned by Market Flow.

## 5. Read-only enforcement

The persistent DB must be opened read-write because the same SQL Authority Worker owns ingest.

Therefore the analytical safety boundary cannot rely on opening the whole DB READ_ONLY.

Required defense layers:

1. classify the user SQL by parsed statement type before execution;
2. require one top-level result-producing query statement;
3. never use prefix/substring/regex-only classification as the safety mechanism;
4. disable external access in the pinned DuckDB build when verified compatible;
5. explicitly control required extensions, disable automatic/community extension paths where compatible, then lock configuration;
6. keep admin/schema SQL on a separate trusted application path.

Current official DuckDB documentation supports database access modes, enable_external_access=false, extension-autoload controls and lock_configuration. Exact availability/ordering in the pinned DuckDB-Wasm package must be proven before implementation is accepted.

Parser-level classification mechanism in the public Wasm API is still an implementation verification item. The contract is fixed even if the mechanism changes.

## 6. Invalid SQL

Invalid user SQL is allowed to become an observable analytical error without threatening ingest.

Behavior:

- if parsing fails, do not send the text to the execution path as an unclassified statement;
- record/emit an analytical execution error for that query version;
- ingestion continues;
- the previous successful analytical result remains separately identifiable;
- later scheduler ticks may retry the same active version until the user changes/disables it.

A syntactically valid but unsafe non-read-only statement is rejected as a safety error and is never executed.

## 7. Scheduler clock model

Selected model: fixed wall-clock cadence anchored to activation.

For interval_ms = X:

~~~text
due(n) = schedule_anchor_ms + n * interval_ms
~~~

This is independent of Recorder/collection cadence.

The schedule is not 'X milliseconds after the previous query finishes', because that would silently drift after every slow execution.

## 8. No overlap / coalescing

At most one analytical execution may be running.

If a tick becomes due while:

- another query execution is running; or
- the SQL Authority is inside a successful-cycle transaction;

the scheduler does not start an overlapping query and does not accumulate an unbounded queue.

Instead it records one pending execution opportunity and coalesces additional missed ticks.

When the authority becomes available:

~~~text
validated cycle commit waiting? → commit has priority
then
at most one coalesced analytical execution runs
~~~

After a delayed/coalesced run, next_due advances to the first future wall-clock cadence boundary. There is no burst catch-up.

query_execution.coalesced_tick_count records how many cadence opportunities were represented by that execution.

## 9. DB-operation priority

Baseline priority after the currently running operation completes:

~~~text
1. validated successful-cycle commit
2. one pending analytical execution
3. maintenance work allowed by later contracts
~~~

Reason: analytical work must not create a backlog that prevents fresh market data from becoming committed.

An already-running query cannot currently be preempted because a verified public DuckDB-Wasm cancellation primitive has not been established.

## 10. Query consistency

At execution start, query_execution captures the last fully committed cycle identity visible to the authority.

The query runs only against coherent committed state.

A cycle arriving during the query waits for the current query to finish before its commit begins; a query arriving during cycle commit waits for the commit.

This preserves the Phase G invariant without relying on unverified multi-connection concurrency.

## 11. Execution status

Minimum logical statuses:

~~~text
running
success
error
interrupted
~~~

Zero rows is success:

~~~text
status = success
row_count = 0
~~~

An error stores structured error metadata where practical:

~~~text
category/class
message
query_version_id
timing
~~~

Do not store secrets or unnecessary sensitive text in errors.

## 12. Latest execution vs latest successful result

The runtime exposes two distinct concepts:

~~~text
latest_execution
latest_successful_execution
~~~

If execution 42 fails after execution 41 succeeded:

~~~text
latest_execution = 42 / error
latest_successful_execution = 41 / success
~~~

A failure never silently erases or masquerades as the previous successful result.

## 13. Result transport / materialization

DuckDB-Wasm officially supports both full materialization with query() and streamed Arrow batches with send(). The target execution path uses streaming for arbitrary user result sizes.

Runtime behavior:

- consume Arrow batches incrementally;
- count the full result row_count;
- materialize only a bounded preview/result payload for Viewer delivery;
- record result_truncated when the delivered payload is smaller than the full result;
- do not silently inject LIMIT into the user's SQL.

The exact preview/display cap is deliberately not fixed until Viewer UX + benchmark evidence exists.

This preserves SQL semantics while avoiding an unbounded JavaScript object array.

## 14. Result sizes

SQL may validly return 0, 1, 5, 500 or many rows.

A large result is not reinterpreted as a different SQL query.

If later benchmarks prove that fully consuming pathological result sets is unsafe, a separate explicit safety policy may be added with visible truncation/rejection semantics; it must not silently rewrite the query.

## 15. Timeout / cancellation

Current Phase D evidence did not verify a public DuckDB-Wasm hard-interrupt API equivalent to native DuckDB interrupt handles.

Therefore the baseline contract does not promise hard cancellation.

Selected behavior until that changes:

- no overlapping execution;
- expose elapsed duration / long-running warning;
- do not terminate the SQL Authority Worker as a routine timeout mechanism;
- ingestion may be delayed by an already-running heavy query and this is observable;
- benchmark gates must prove the intended live queries remain comfortably below their cadence;
- implementation may add hard cancellation only after a pinned Wasm API proves safe interruption.

A configurable soft warning threshold is observability, not cancellation.

## 16. Scheduler and query failures do not stop ingestion

After a normal analytical error:

~~~text
query_execution = error
→ Worker remains usable
→ Recorder/ingest continues
→ next scheduled tick may retry
~~~

A fatal database/Worker failure is a different failure class handled by persistence/recovery and failure-hardening phases.

On reopen, a persisted running execution from a dead prior runtime is classified as interrupted; it is not converted into success/error by guesswork.

## 17. Security hardening direction

Official DuckDB guidance provides controls relevant to user SQL:

~~~text
enable_external_access = false
autoinstall_known_extensions = false
autoload_known_extensions = false
allow_community_extensions = false
lock_configuration = true
~~~

Implementation must verify the exact supported settings/order in the pinned DuckDB-Wasm build and preload only required trusted capabilities before locking.

This prevents analytical SQL from becoming an accidental network/file/extension/admin surface.

## 18. Acceptance scenarios

H-A1: changing SQL creates a new immutable version; an already-running execution keeps its old version identity.

H-A2: SELECT/JOIN/GROUP BY/HAVING/window SQL can execute without application rebuild.

H-A3: DDL/DML/admin SQL is rejected before analytical execution.

H-A4: a syntax error is observable, does not stop ingestion and does not replace the last successful result.

H-A5: 0 rows is a successful execution.

H-A6: scheduler cadence is anchored to activation and does not drift by 'completion + interval'.

H-A7: if a query overruns two ticks, no overlapping executions start; missed ticks coalesce to at most one pending execution.

H-A8: if a validated market cycle is waiting when the current DB operation finishes, its commit runs before a pending catch-up query.

H-A9: a query that becomes due during cycle commit runs only after the coherent commit.

H-A10: a large result is streamed/countable; Viewer payload can be bounded and visibly marked truncated without changing SQL text.

H-A11: latest failed execution and latest successful execution remain distinguishable.

H-A12: without a verified Wasm interrupt API, a long query is warned/observed rather than pretending it was hard-cancelled.

## 19. Deferred

Phase H does not decide:

- OPFS checkpoint cadence and recovery;
- exact persistence of active scheduler state after refresh;
- runtime asset packaging;
- Viewer UI/editor layout;
- exact preview cap;
- IndexedDB migration;
- benchmark pass/fail thresholds.

## 20. Completion result

~~~text
immutable SQL version
→ read-only safety gate
→ fixed anchored cadence
→ no overlap
→ missed-tick coalescing
→ ingest priority
→ committed-state query
→ streamed result accounting
→ distinct latest-execution / latest-success state
~~~

## 21. Official references

Current planning evidence:

- DuckDB-Wasm query API: https://duckdb.org/docs/current/clients/wasm/query
- DuckDB-Wasm instantiation/access mode: https://duckdb.org/docs/current/clients/wasm/instantiation
- DuckDB security overview: https://duckdb.org/docs/current/operations_manual/securing_duckdb/overview
- DuckDB extension security: https://duckdb.org/docs/current/operations_manual/securing_duckdb/securing_extensions
- DuckDB configuration settings: https://duckdb.org/docs/current/configuration/overview

These sources establish streaming query support and the available DuckDB security/configuration controls. Parser-level statement classification and hard interruption remain implementation-verification items for the exact pinned DuckDB-Wasm package.
