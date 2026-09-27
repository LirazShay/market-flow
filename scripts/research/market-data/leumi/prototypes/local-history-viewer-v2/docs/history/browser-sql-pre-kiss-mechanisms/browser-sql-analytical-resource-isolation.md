# Browser SQL — Analytical Resource Isolation and Runaway-Query Safety

This is the Phase T planning artifact added by the post-Phase-R assurance review.

It closes the gap where arbitrary user SQL could monopolize the single SQL Authority Worker and delay validated-cycle persistence.

Durable decision: ../../../../../../../docs/project/decisions/D-039.md

## 1. Problem

The target intentionally supports arbitrary read-only analytical SQL.

The existing scheduler prevents query overlap and gives waiting cycle commits priority, but priority alone is insufficient if one analytical query is already running and cannot yield/cancel quickly.

Therefore the target needs an explicit resource-isolation contract.

## 2. Current upstream capability evidence

Current DuckDB-Wasm upstream source (reviewed 2026-09-25) exposes:

- `AsyncDuckDBConnection.send()` using pending-query start/poll + streamed Arrow results;
- `AsyncDuckDBConnection.cancelSent()` forwarding to `cancelPendingQuery()`;
- `queryPollingInterval` configuration;
- upstream tests that cancel a pending query and then successfully reuse the connection.

Current source also shows an important boundary:

`CancelPendingQuery()` succeeds only while the query is still a pending query and no stream result is active.

Once a streamed result is active, cancellation of the remaining result-consumption path needs a separately verified mechanism such as stopping fetches and disposing/recreating the dedicated analytical connection.

Evidence sources:

- https://duckdb.org/docs/current/clients/wasm/query
- https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm/src/parallel/async_connection.ts
- https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm/src/parallel/async_bindings.ts
- https://github.com/duckdb/duckdb-wasm/blob/main/packages/duckdb-wasm/test/bindings.test.ts
- https://github.com/duckdb/duckdb-wasm/blob/main/lib/src/webdb.cc

Exact production behavior remains **pending pinned-version verification**. WP-01/WP-40 must re-prove these APIs in the exact selected package.

## 3. Connection separation inside one authority

The one SQL Authority Worker remains the only DuckDB/OPFS owner.

Inside that Worker, use separate logical connections:

~~~text
trustedConnection
→ schema/admin/ingest/checkpoint work

analyticsConnection
→ user analytical SQL only
~~~

The analytics connection is disposable/recreatable.

User SQL never runs on the trusted writer/admin connection.

This is isolation inside one authority, not a second database owner.

## 4. User SQL execution path

Arbitrary analytical SQL must not use a whole-result materializing `query()` path as the production execution primitive.

Required shape:

~~~text
classify read-only SQL
→ start pending query
→ bounded poll/yield
→ streamed Arrow batches
→ bounded preview + incremental counters
~~~

The exact pinned API may use the documented/high-level `send()` surface or a tested lower-level pending-query wrapper, but the observable contract is:

- execution yields back to JavaScript/Worker control at bounded intervals;
- a cancellation/preemption request can be observed between work slices;
- result consumption does not require materializing the entire result in JS memory.

## 5. Ingest always preempts analytics

When a complete validated cycle reaches the SQL Authority while analytics is active:

~~~text
mark ingest waiting
→ request analytical preemption immediately
→ stop starting/fetching additional analytical work
→ establish analytics query termination
→ commit/checkpoint the cycle
→ only then allow a later analytical opportunity
~~~

There is no grace period in the correctness contract.

Ingest priority is immediate; measured cancellation latency is the only allowed delay.

## 6. Pending-query cancellation

If the analytical query is still in the pending-execution phase:

~~~text
cancelSent / cancelPendingQuery
→ confirm cancellation or natural completion
~~~

A cancellation request returning false is not automatically an error; it may mean the pending query already finished.

The runtime must reconcile actual connection/query state before proceeding.

## 7. Stream/result-phase abort

If a result stream is already active:

~~~text
stop requesting further batches immediately
→ wait for at most the currently in-flight bounded fetch
→ dispose/close the analytics connection
→ recreate analyticsConnection after ingest
~~~

The exact pinned build must prove that this releases the stream/query safely and leaves the database ready.

The production target must not assume `cancelPendingQuery()` can cancel an already-active result stream unless the pinned build proves it.

## 8. At most one result fetch in flight

Result consumption uses explicit backpressure:

~~~text
0 or 1 Arrow fetch in flight
~~~

No unbounded prefetch queue.

After every returned batch:

- update row counters;
- copy only the bounded Viewer preview portion;
- check ingest-waiting/preemption state;
- check wall-clock resource budget;
- either fetch one next batch or stop.

## 9. Full row-count semantics under resource limits

For a normal successful query:

~~~text
row_count = exact full consumed result row count
row_count_complete = true
~~~

If execution is cancelled/preempted/resource-limited:

~~~text
partial_row_count = rows consumed before termination
row_count_complete = false
status != success
~~~

The runtime never silently reports a partial count as complete.

It also never injects a hidden SQL `LIMIT` to manufacture success.

## 10. Hard analytical runtime budget

Every analytical execution has a hard wall-clock runtime budget.

The production value is not hardcoded in planning.

It is selected from WP-35 target Windows/Chrome evidence and recorded as an explicit runtime/build configuration value:

~~~text
analytical_max_runtime_ms
~~~

The chosen value must preserve the collection/ingest headroom gates from D-034.

When the budget expires:

~~~text
request cancellation/stream abort
→ execution status = cancelled
→ cancel_reason = runtime_budget
→ suspend the active query version from automatic scheduling
~~~

The user must explicitly edit/reactivate/resume before that version runs again.

This prevents one pathological SQL version from burning every future scheduler tick.

## 11. Ingest-priority cancellation does not auto-disable

If a query is cancelled only because a new validated cycle arrived:

~~~text
status = cancelled
cancel_reason = ingest_priority
active query remains enabled
~~~

The scheduler may try again only on a later normal due opportunity after the cycle commit.

There is no immediate retry and no catch-up burst.

Repeated ingest-priority cancellations remain visible in health/diagnostics and benchmark evidence.

## 12. Cancellation latency budget

Production also has an evidence-based:

~~~text
analytics_preemption_budget_ms
~~~

meaning the maximum allowed time from validated-cycle arrival to analytical work being out of the way for the writer.

The value must be selected by WP-35 from real cancellation/connection-recycle measurements and fit inside the mixed-load ingest headroom gate.

Query polling/fetch slicing must be configured so one Worker task cannot routinely exceed this budget.

## 13. Cancellation failure escalation

If cooperative pending cancellation or stream-connection disposal does not complete within the preemption budget:

~~~text
query-runtime = blocked
Recorder acknowledgement remains paused
→ controlled SQL Worker termination/reopen recovery
~~~

Why this is permitted:

- the active analytical SQL is read-only;
- no write transaction is allowed concurrently;
- successful market cycles were checkpointed before acknowledgement;
- the waiting validated cycle still has its stable ingest_token and has not been acknowledged.

After Worker recreation:

~~~text
OPFS reopen/readiness
→ reconcile authoritative state
→ recreate analytics connection
→ commit waiting cycle with same ingest_token
~~~

If readiness cannot be proven, health becomes `recovery-required`; do not acknowledge or continue collection.

## 14. One pending validated cycle maximum

The Runtime Controller does not build an unbounded queue of complete cycles while SQL authority is unavailable.

Once one complete validated cycle is waiting for persistence:

~~~text
do not start another provider collection cycle
~~~

until that cycle is durably acknowledged or the runtime enters blocked/recovery-required state.

This keeps memory/ordering bounded and prevents stale cycles from accumulating behind a runaway query.

## 15. Query execution states

Extend query execution outcome vocabulary:

~~~text
running
success
error
cancelled
interrupted
~~~

For `cancelled`, record a sanitized reason:

~~~text
ingest_priority
runtime_budget
runtime_shutdown
user_reactivation_or_replacement (if applicable)
~~~

Do not classify a resource cancellation as a SQL syntax/runtime error.

## 16. Persistent active-query state

Active query state adds:

~~~text
enabled
suspension_reason?
suspended_at_ms?
~~~

A runtime-budget cancellation sets:

~~~text
enabled = false
suspension_reason = runtime_budget
~~~

Ingest-priority cancellation leaves enabled unchanged.

## 17. Result-memory budget

Viewer preview remains bounded independently of SQL result size.

Production configuration records explicit limits such as:

~~~text
preview_max_rows
preview_max_bytes
~~~

These limits affect only retained/displayed preview, not SQL semantics.

Full result rows are streamed/count-consumed only while the execution remains within time/preemption budgets.

## 18. Large-result behavior

A query that produces a huge valid result may:

- complete successfully if it can be fully consumed within resource budgets;
- be cancelled by ingest priority;
- hit runtime budget and become suspended.

All three are observable.

There is no claim that every syntactically valid arbitrary SQL query is guaranteed to complete while continuous recording is active.

The product guarantee is that arbitrary read-only SQL is accepted subject to explicit resource-isolation limits that protect recording correctness.

## 19. Scheduler integration

Scheduler rules become:

1. never overlap analytical executions;
2. never start analytics while a validated cycle is waiting/committing;
3. a validated cycle arriving during analytics immediately requests preemption;
4. cancelled-for-ingest execution does not trigger immediate retry;
5. runtime-budget cancellation suspends that active query version;
6. after ingest, resume only from normal anchored cadence/coalescing rules.

## 20. Health and diagnostics

Observe at least:

~~~text
query_started_at_ms
cancel_requested_at_ms?
cancel_completed_at_ms?
cancel_reason?
partial_row_count?
row_count_complete
analytics_connection_recycled
worker_recovery_triggered
ingest_wait_started_at_ms?
ingest_wait_due_to_analytics_ms
consecutive_ingest_priority_cancellations
~~~

One resource cancellation sets query-runtime/scheduler health to degraded until a later normal successful execution.

Worker-recovery escalation is blocked/recovery state per D-036.

## 21. Benchmark additions

WP-35 must measure:

- pending-query cancellation latency;
- stream-phase connection-disposal/recreation latency;
- worst/p95 validated-cycle wait caused by analytics;
- behavior with one very expensive CPU query;
- behavior with a very large streamed result;
- Worker-recovery fallback latency;
- memory while abandoned/cancelled streams are reclaimed;
- repeated ingest-priority cancellation behavior;
- selected `analytical_max_runtime_ms`;
- selected `analytics_preemption_budget_ms`;
- query polling/fetch slice configuration.

## 22. Pinned-version verification gate

WP-40 cannot rely only on current upstream main.

For the exact WP-01 package/build it must prove in Chromium:

1. pending query can be cancelled;
2. cancellation result is distinguishable from query error;
3. connection remains usable after normal pending cancellation;
4. stream result can be abandoned by the selected connection-disposal mechanism;
5. analytics connection can be recreated without reopening/replacing the authoritative DB;
6. Writer can commit immediately after analytical cancellation/recycle;
7. if cooperative cancellation hangs/fails, Worker terminate/reopen preserves database readiness and waiting ingest-token semantics.

If any of these fail, the execution architecture must be reopened before cutover.

## 23. Acceptance scenarios

T-A1: a validated cycle arrives during pending analytical execution; cancellation is requested immediately and the cycle commits before any later query opportunity.

T-A2: cancellation returns false because the pending query naturally completed; runtime reconciles completion and does not mislabel a failure.

T-A3: a validated cycle arrives while result batches are streaming; no new batch is requested, the analytical connection is disposed/recreated, then ingest commits.

T-A4: only one result fetch is in flight; no result-prefetch backlog grows.

T-A5: a query exceeds analytical_max_runtime_ms; it is cancelled and its active version is automatically suspended until explicit user action.

T-A6: ingest-priority cancellation does not automatically disable the active query and does not cause immediate retry.

T-A7: cancelled execution reports partial_row_count only with row_count_complete=false and never overwrites latest successful result.

T-A8: cooperative cancellation fails past analytics_preemption_budget_ms; Runtime Controller performs controlled Worker reopen/recovery and never acknowledges the waiting cycle early.

T-A9: while one validated cycle is waiting for SQL persistence, Recorder does not start another provider collection.

T-A10: a huge result never materializes wholly in JS memory and preview limits do not silently rewrite SQL.

T-A11: exact pinned DuckDB-Wasm cancellation/stream-abort behavior is proven in Chromium before M3 closes.

## 24. Completion result

~~~text
arbitrary read-only SQL
+ dedicated disposable analytics connection
+ cancellable pending execution
+ stream-phase abort path
+ immediate ingest preemption
+ hard runtime budget
+ bounded one-batch backpressure
+ truthful partial-row accounting
+ controlled Worker-recovery fallback
+ no unbounded cycle queue
~~~