# Browser SQL — Failure, Security and Observability Contract

This is the Phase O planning artifact for Local History Viewer V2.

It defines failure scopes/dispositions, health precedence, retry boundaries, security/redaction rules and the minimum observable runtime contract.

It does not implement monitoring UI or diagnostics code.

Durable decision: ../../../../../../../docs/project/decisions/D-036.md

## 1. Design goals

The runtime must make failures explicit, scoped to the smallest affected subsystem, safe for market-history integrity, recoverable where recovery is proven, and visible without exposing browser/session secrets.

A failure in one subsystem must not automatically invalidate unrelated healthy state.

## 2. Lifecycle and health are separate

Runtime lifecycle:

~~~text
idle
starting
ready
stopping
stopped
~~~

Operational health:

~~~text
healthy
degraded
blocked
recovery-required
~~~

Overall health is the worst active component state:

~~~text
recovery-required
> blocked
> degraded
> healthy
~~~

A stopped runtime is a lifecycle state, not automatically a health failure.

## 3. Component health

Minimum components:

~~~text
runtime/bootstrap
provider/recorder
sql-authority
persistence/durability
query-runtime
scheduler
viewer-bridge
migration/cutover
storage
~~~

Each component exposes its own current health and latest sanitized incident summary.

## 4. Failure disposition vocabulary

Every meaningful failure has one disposition:

~~~text
operation-local
retry-next-cycle
retry-next-query
resync-viewer
restart-worker
blocked-until-environment-change
blocked-until-storage-action
recovery-required
explicit-rollback-required
~~~

There is no generic retry-everything mechanism. Retry is allowed only at boundaries whose idempotency/correctness is already defined.

## 5. Provider/network failures

Transient request/network failure:

~~~text
current collection attempt only
market authority unchanged
health = degraded
~~~

Behavior:

- persist sanitized failed-cycle diagnostics when the DB is healthy;
- never persist partial market rows;
- retry only on the next normal collection cadence;
- no immediate tight-loop retry storm;
- a later successful complete cycle clears provider degradation.

If the real provider response explicitly proves authenticated-session loss:

~~~text
Recorder blocks new successful cycles
health = blocked
action = user restores authenticated session / relaunches
~~~

Do not copy credentials into another context or bypass access controls.

## 6. Validation/data-integrity failures

Duplicate, missing, unexpected IDs, invalid response shape or complete-cycle validation failure:

~~~text
cycle = failed
0 successful snapshots committed
health = degraded
retry = next normal collection cycle
~~~

Unknown values remain unknown; repeated failure never triggers hidden partial acceptance or schema fallback.

## 7. Bootstrap / CSP / engine-asset failures

Examples:

- Blob Worker blocked;
- Worker asset blocked/404;
- Wasm fetch/compile/instantiate failure;
- OPFS capability unavailable;
- pinned asset mismatch.

Impact:

~~~text
SQL Authority never READY
Recorder does not start
health = blocked
~~~

No alternate CDN/version, IndexedDB fallback, CSP bypass or automatic restart loop.

## 8. SQL Worker unexpected loss

Unexpected loss after READY:

~~~text
pause new Recorder acknowledgements
pause new scheduled query starts
health = degraded
→ one controlled Worker recreation/reopen attempt
~~~

If reopen/readiness succeeds, reconcile pending ingest_token and resume.

If controlled recovery fails:

~~~text
health = recovery-required
Recorder remains stopped
~~~

No unbounded Worker restart loop.

## 9. Market-cycle SQL transaction failure before COMMIT

~~~text
ROLLBACK
prior committed state remains authoritative
cycle attempt = failed
~~~

If the DB remains coherent/ready, health is degraded and the next normal cycle may try again.

If readiness cannot be established, health becomes recovery-required and no more writes occur.

## 10. CHECKPOINT failure after COMMIT

Immediate state:

~~~text
durability = uncertain
health = blocked
success acknowledgement withheld
new cycle writes paused
~~~

Recovery reconciles the stable ingest_token.

If reconciliation + checkpoint/readiness succeeds, resume.

If durable state cannot be proven, health becomes recovery-required.

No blind replay.

## 11. Quota / storage exhaustion

QuotaExceededError or equivalent inability to persist durably:

~~~text
health = blocked
storage = storage-blocked
Recorder successful acknowledgements stop
~~~

Do not automatically delete history, drop new cycles, switch storage engines or report healthy recording.

## 12. Schema/readiness/corruption failures

Examples:

- database schema newer than runtime;
- failed migration;
- broken latest_snapshot reference;
- incompatible/unknown schema;
- DB cannot reopen/read coherently.

Impact:

~~~text
health = recovery-required
Recorder does not start/resume
~~~

Normal startup never deletes/replaces the DB automatically.

## 13. Query activation errors

Expected user-input problems such as parse failure, unsafe statement type or stale expectedActiveQueryVersionId are command-local failures.

~~~text
activation rejected
previous active query unchanged
overall runtime health unchanged
~~~

A bad draft does not degrade healthy ingest.

## 14. Active query execution errors

~~~text
query-runtime health = degraded
ingest continues
latest execution = error
latest successful execution/result remains identifiable
retry = next scheduled query tick
~~~

A later successful execution clears active query-runtime degradation.

Zero rows remains success.

## 15. Scheduler pressure

A coalesced/missed analytical tick is observable.

In normal production operation:

~~~text
coalesced tick
→ scheduler health = degraded
~~~

The one-pending-query rule remains bounded. No overlap/burst catch-up is introduced to hide lateness.

## 16. Viewer failures

Viewer close/disconnect/missed notification affects only that client.

~~~text
core runtime health unchanged
viewer client = disconnected/stale
action = reattach/full-state resync
~~~

Viewer transport failure cannot turn a committed cycle/query into a failed authoritative operation.

## 17. Migration/cutover failures

Before production cutover, SQL probe/shadow failure leaves IndexedDB authoritative and production health unchanged.

After SQL cutover, authority startup/recovery failure never silently reactivates IndexedDB.

Explicit rollback is an operator/release action from Phase N.

## 18. Security boundary — provider session

Authentication stays owned by the already-authenticated Leumi page.

Never send to SQL Worker, Viewer, logs, Debug Bundle, CI artifacts or repository files:

- cookies;
- authorization headers;
- session tokens;
- account numbers;
- private session-storage values;
- authenticated HAR files.

SQL Worker receives validated market data and explicit runtime commands only.

## 19. Security boundary — user SQL

User SQL is local application data.

Rules:

- store versioned SQL only in the local Browser SQL database;
- never put SQL text into generated repository/runtime artifacts;
- diagnostics omit full SQL text by default;
- identify SQL by queryVersionId/executionId plus safe length/hash metadata where useful;
- arbitrary query-result rows are omitted from default diagnostics;
- read-only statement classification and DuckDB hardening remain mandatory.

A future explicit export-SQL feature is separate from diagnostics.

## 20. Security boundary — diagnostics

Diagnostics are allowlist-based, not capture-everything-then-redact.

Allowed classes:

~~~text
runtime/build/engine version
component statuses
timestamps/durations
counts
cycle/query/session IDs
sanitized endpoint name or HTTP status when needed
storage usage/quota estimates
bounded sanitized error code/category/message
fingerprints/hashes instead of raw payloads
~~~

Default diagnostics exclude:

~~~text
raw MapHeat/Security payloads
cookies/headers/tokens
account/private-page DOM
arbitrary query rows
full user SQL
authenticated request/response dumps
HAR files
private screenshots
raw browser-storage dumps
~~~

## 21. Sanitized incident shape

Conceptual incident:

~~~text
incidentId
atMs
domain
code
healthImpact
disposition
operation
runtimeInstanceId
sessionId? / cycleId? / queryVersionId? / executionId?
message
detailsAllowlist
~~~

Rules:

- bounded message length;
- no raw Error serialization;
- no default raw stack in downloadable diagnostics;
- numeric zero stays distinct from null;
- unknown values stay unknown/null.

## 22. Durable observability ownership

Do not add a second unbounded generic event database.

Durable evidence remains owned by purpose-specific records:

~~~text
recording_session
cycle
query_version
query_execution
schema/runtime config state
~~~

Failures before DB availability remain visible in bounded Runtime Controller memory.

## 23. Bounded recent diagnostics

Runtime Controller/SQL Authority may keep a bounded recent-incident ring for Viewer/debugging.

Contract:

- bounded memory;
- newest incidents available;
- not market authority;
- non-persisted incidents may disappear on restart;
- durable cycle/query/session evidence remains in owning tables.

Exact capacity is an implementation constant, not a product contract.

## 24. Health snapshot

ViewerStateSnapshot includes at least:

~~~text
runtime lifecycle
overall health
component health map
durability class
storage state
last committed cycle ID/time
Recorder completed/failed counts
last provider/validation failure summary
SQL Authority/recovery state
active query version
latest execution status/duration/row count
latest successful execution ID/time
scheduler next due / coalesced count
Worker restart/recovery state
estimated storage usage/quota when available
runtime + DuckDB-Wasm build identity
~~~

No sensitive session material is included.

## 25. Health/status precedence

Overall health is derived from active component health, never overwritten by the last event.

Examples:

~~~text
query error + healthy persistence
→ degraded

Viewer disconnect + healthy runtime
→ healthy core runtime; Viewer disconnected

storage-blocked + query success
→ blocked

schema/readiness failure + provider success
→ recovery-required
~~~

A lower-severity success cannot clear a higher-severity failure in another component.

## 26. Clearing incidents

Incidents clear only through domain-relevant success/recovery.

Examples:

- provider degradation clears after a complete provider cycle;
- query degradation clears after a successful execution of the active query;
- Worker degradation clears after successful reopen/readiness;
- storage-blocked clears after storage recovery + readiness;
- recovery-required never clears because an unrelated component succeeds.

## 27. Debug Bundle target

Retain and extend the existing sanitized Debug Bundle concept.

It should report:

- exact runtime/repository/engine identity;
- health snapshot;
- sanitized storage/durability state;
- bounded recent incidents;
- recent cycle summaries;
- query execution summaries;
- scheduler counters;
- readiness/recovery state;
- safety flags confirming excluded secret/raw classes.

It must remain useful even before the first successful cycle.

Generating it is observational: no provider request, DB mutation or retry.

## 28. Logging/telemetry

Baseline target has no external telemetry service.

Console logging may aid local diagnosis but must use sanitized summaries and never print cookies/headers/tokens/raw authenticated payloads.

Repeated identical failures should be compacted/countable rather than spam every cadence.

Any future remote telemetry requires a separate explicit security/privacy decision.

## 29. Alert presentation

Viewer presentation distinguishes:

~~~text
blocking/recovery banner
component degradation warning
command-local editor error
latest query execution error
Viewer-local disconnected state
~~~

Blocking/recovery state takes precedence, while latest successful state remains clearly labeled where safe.

## 30. Minimum failure matrix

| Domain | Example | Health impact | Automatic action |
|---|---|---|---|
| provider | transient request failure | degraded | next normal cycle |
| provider auth | session unavailable | blocked | user/environment action |
| validation | duplicate/missing/shape | degraded | next normal cycle |
| bootstrap | CSP/Worker/Wasm blocked | blocked | relaunch after environment fix |
| Worker | unexpected loss | degraded → recovery-required | one controlled reopen |
| transaction | pre-COMMIT failure | degraded or recovery-required | rollback + readiness decision |
| durability | CHECKPOINT ambiguity | blocked → recovery-required | ingest-token reconciliation |
| storage | quota exhausted | blocked | explicit storage action |
| schema/readiness | incompatible/corrupt state | recovery-required | explicit recovery |
| SQL activation | unsafe/parse/stale editor | no runtime-health change | reject command |
| SQL execution | active query error | degraded | next query tick |
| scheduler | coalesced tick | degraded | bounded coalescing |
| Viewer | disconnect/missed hint | no core-health change | resync/reattach |
| pre-cutover shadow | candidate failure | no production-health change | keep IndexedDB authority |
| post-cutover SQL | startup/recovery failure | blocked/recovery-required | explicit recovery/rollback |

## 31. Acceptance scenarios

O-A1: one provider request fails; no partial rows commit, health degrades, and the next normal cycle can recover.

O-A2: provider session is explicitly unavailable; Recorder blocks rather than bypassing authentication.

O-A3: a bad SQL draft is rejected while prior active query and healthy runtime continue.

O-A4: an active query fails; ingest continues and prior successful result stays identifiable.

O-A5: quota exhaustion blocks successful recording acknowledgements without deleting history.

O-A6: CHECKPOINT fails after COMMIT; durability becomes uncertain/blocked and cycle is not blindly replayed.

O-A7: Worker dies; one controlled reopen reconciles pending ingest_token without duplicate history.

O-A8: Worker reopen/readiness fails; overall health becomes recovery-required and Recorder stays stopped.

O-A9: Viewer notification is dropped; core health remains unchanged and full-state resync repairs display.

O-A10: query success cannot clear active storage-blocked state.

O-A11: Debug Bundle contains build/status/counters/incidents but no raw provider payload, cookies, headers, tokens, full SQL text or arbitrary result rows.

O-A12: a pre-DB bootstrap failure remains visible through bounded Controller diagnostics.

O-A13: repeated provider/validation failures retry only on normal cadence, never an immediate tight loop.

O-A14: pre-cutover shadow SQL failure does not affect IndexedDB production health.

O-A15: after cutover SQL recovery failure never silently reactivates IndexedDB.

## 32. Phase O completion result

~~~text
explicit failure scope
+ boundary-specific bounded retry
+ worst-active component health precedence
+ successful historical state survives later failures
+ sanitized local diagnostics
+ purpose-specific durable evidence
+ bounded recent incidents + Debug Bundle
+ no external telemetry baseline
~~~

## Phase T analytical-resource failures

Analytical execution now has explicit cancellation/resource outcomes. `cancelled / ingest_priority` degrades query runtime but leaves the query enabled; `cancelled / runtime_budget` suspends that active query version. Cooperative cancellation that cannot release analytical work inside the preemption budget escalates to blocked + controlled Worker reopen. Only one complete validated cycle may wait during this recovery; Recorder does not start another collection cycle.
