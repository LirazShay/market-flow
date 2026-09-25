# Browser SQL — Viewer and Result Delivery

This is the Phase K planning artifact for Local History Viewer V2.

It defines Viewer attachment/re-attachment, Controller-to-Viewer state delivery, missed-notification recovery, multi-Viewer behavior, SQL editor activation, execution/result presentation and result-preview lifetime.

It does not define the detailed test matrix; that belongs to Phase L.

Durable decision: ../../../../../../../docs/project/decisions/D-032.md

## 1. Viewer authority boundary

Viewer windows are clients of the Runtime Controller.

They do not:

- open DuckDB;
- own OPFS handles;
- run provider collection;
- execute analytical SQL directly;
- treat messages as authoritative persisted state.

Authoritative market/query state remains in the SQL Authority / persistent database, with runtime state coordinated by Runtime Controller.

## 2. Selected Viewer transport

Baseline target: same-origin child Viewer windows attach directly to the Runtime Controller through a small asynchronous Viewer bridge.

Conceptual shape:

~~~text
Viewer
→ attach(viewerId)
→ Runtime Controller
→ authoritative snapshot request
→ SQL Authority as needed
→ normalized ViewerStateSnapshot
~~~

The bridge may use direct same-origin function calls internally because the Viewer is opened by the authenticated page runtime.

Do not make BroadcastChannel the data path for Viewer state.

## 3. Notification remains a hint

Runtime changes may trigger lightweight Viewer notifications:

~~~text
state changed
→ notify viewer with revision/identity metadata
→ viewer requests fresh ViewerStateSnapshot
~~~

A notification carries no authority.

If a notification is lost, Viewer correctness is unaffected; the next attach/manual sync/notification performs a fresh snapshot request.

This preserves the proven principle:

~~~text
message = wake-up / hint
authoritative snapshot = actual state
~~~

BroadcastChannel may remain an optional discovery/wake mechanism, but the target Viewer contract does not depend on it for correctness.

## 4. stateRevision

Runtime Controller exposes a monotonically increasing in-memory stateRevision for Viewer-facing state changes.

Notifications contain:

~~~text
type
stateRevision
atMs
relevant IDs only
~~~

ViewerStateSnapshot also contains stateRevision.

Rules:

- revision orders state within the current Runtime Controller lifetime;
- revision is not a persistent database identity;
- after page/runtime restart, a new revision sequence may begin;
- Viewer must never compare revisions across different runtimeInstanceId values.

## 5. runtimeInstanceId

Each Runtime Controller lifetime gets an opaque runtimeInstanceId.

Viewer state carries:

~~~text
runtimeInstanceId
stateRevision
~~~

If runtimeInstanceId changes, Viewer discards assumptions about prior in-memory preview/subscription state and performs full re-attachment.

## 6. ViewerStateSnapshot

Minimum normalized snapshot:

~~~text
runtime:
  runtimeInstanceId
  stateRevision
  status
  startupFailure / recovery state

persistence:
  durabilityClass
  storageState
  estimatedUsage/quota when available

recorder:
  status
  sessionId
  lastCommittedCycleId
  lastCommittedAtMs
  lastError summary

query:
  activeQueryVersionId
  enabled
  intervalMs
  scheduleAnchorMs
  nextDueAtMs
  scheduler state

execution:
  latestExecution summary
  latestSuccessfulExecution summary

resultPreview:
  executionId
  columns/schema metadata
  rows[]
  previewRowCount
  fullRowCount
  truncated
  available
~~~

Only data needed by Viewer is exposed; raw authentication/session data is never included.

## 7. Result-preview lifetime

V2 baseline does not persist arbitrary analytical result payloads in DuckDB.

Persisted authority includes query definitions/versions and execution metadata.

The bounded latest-success result preview is runtime memory derived from the streamed Arrow result.

Why:

- analytical results are reproducible derived data;
- persisting arbitrary schemas/types adds complexity and database growth;
- live scheduler normally refreshes results frequently;
- Market Flow source/history remains authoritative.

After Runtime Controller/Worker restart:

~~~text
latest successful execution metadata = recoverable
latest successful result preview      = unavailable until a new success
~~~

Viewer must say this explicitly rather than showing stale rows from a dead runtime.

Viewer attachment does not automatically execute SQL just to reconstruct a preview.

## 8. Result materialization

Phase H streams the full result for accounting while retaining only a bounded Viewer preview.

Viewer presentation rules:

- 0 rows is success and displays an empty-success state;
- if truncated=false, show the complete materialized preview returned by runtime;
- if truncated=true, show `previewRowCount` and `fullRowCount` when known;
- never imply that preview rows are the complete result when truncated;
- preserve column order/schema metadata supplied by the execution result;
- do not silently add a SQL LIMIT.

The numeric preview cap remains benchmark/UX-configurable and is not hardcoded by the Phase K contract.

## 9. Latest execution vs latest successful result

Viewer must present these separately.

Example:

~~~text
latest execution:           #42 ERROR at 12:01:05
latest successful execution:#41 SUCCESS at 12:01:00
result preview shown:       #41
~~~

An error banner for #42 must not erase or relabel the #41 successful preview.

Every preview clearly identifies the executionId/queryVersionId that produced it.

## 10. Query editor boundary

Viewer owns only draft/editor state.

Activation request:

~~~text
activateQuery({
  sqlText,
  intervalMs,
  expectedActiveQueryVersionId
})
~~~

Runtime Controller forwards the command to the SQL Authority.

SQL Authority performs Phase H safety classification and creates/activates the immutable query version.

Viewer never writes query tables directly.

## 11. Multi-Viewer edit concurrency

Multiple Viewer clients may inspect the same runtime.

To prevent silent lost updates, query activation uses optimistic concurrency:

~~~text
expectedActiveQueryVersionId
~~~

If the authoritative active version changed since a Viewer loaded its editor state:

~~~text
activation rejected
→ stale-editor-state
→ Viewer resyncs
→ user can reapply deliberately
~~~

No Viewer silently overwrites another Viewer's newer activation.

## 12. Viewer attachment

On attach or reopen:

~~~text
Viewer obtains Runtime Controller bridge
→ receives viewerId
→ requests full ViewerStateSnapshot
→ renders snapshot
→ subscribes to lightweight state-change notifications
~~~

Attach is successful only when the current runtimeInstanceId is known.

If no healthy Runtime Controller exists, Viewer displays disconnected/runtime-unavailable state and does not attempt direct database recovery.

## 13. Viewer reload / re-attachment

A same-origin Viewer reload loses its in-memory client subscription.

Recovery:

~~~text
reload
→ bootstrap Viewer shell
→ find/reacquire current Runtime Controller bridge
→ new attach
→ full snapshot
~~~

No reliance on previously received messages is required.

## 14. Runtime restart while Viewer remains open

If Runtime Controller disappears/restarts:

- old bridge/subscription becomes disconnected;
- Viewer marks runtime unavailable;
- when a new controller is discoverable/re-attached, Viewer receives a new runtimeInstanceId;
- Viewer discards old in-memory result preview unless the new runtime explicitly owns a new preview;
- full snapshot is requested before normal display resumes.

## 15. Multi-Viewer behavior

Target architecture permits multiple Viewer clients.

Rules:

- all read the same Runtime Controller/SQL Authority state;
- each has an independent viewerId and UI/editor draft;
- closing one Viewer does not stop Recorder, scheduler or other Viewers;
- closing all Viewers does not stop the runtime;
- Viewer count does not create additional DuckDB/OPFS owners;
- one Viewer query activation becomes authoritative for all after successful activation.

The initial user-facing launch may continue to reuse one primary named Viewer window; protocol support for multiple clients does not require adding UI to spawn many windows.

## 16. Viewer close semantics

Close means:

~~~text
unsubscribe client
→ release Viewer-side resources
→ close window
~~~

It does not mean stop Recorder or SQL scheduler.

Explicit runtime stop remains a separate Runtime Controller action.

## 17. Command/result correlation

Every Viewer command uses an opaque requestId.

Command response contains:

~~~text
requestId
ok
runtimeInstanceId
stateRevision
result or structured error
~~~

This prevents a slow response from being applied to the wrong editor action after newer Viewer activity.

## 18. Structured Viewer errors

Viewer-facing errors distinguish at least:

~~~text
runtime-unavailable
runtime-not-ready
stale-editor-state
sql-safety-rejected
sql-parse-error
query-execution-error
storage-blocked
recovery-required
result-preview-unavailable
~~~

Do not expose cookies, headers, tokens, account information or unnecessary raw stack data.

## 19. Diagnostics presentation

Viewer diagnostics should expose clearly:

- runtime/controller status;
- SQL authority readiness;
- persistent vs best-effort durability;
- last committed cycle;
- active query version/interval;
- next scheduler due time;
- latest execution status/duration/row count;
- latest successful execution identity;
- whether shown preview is truncated;
- storage usage/quota estimates when available;
- last sanitized runtime/query/persistence error;
- engine package/build identity useful for support.

Diagnostics are observational; changing them does not mutate authority.

## 20. Notification failure

If push notification delivery fails:

~~~text
database/runtime state remains valid
Viewer may remain visually stale temporarily
manual sync / reattach / later notification repairs display
~~~

Notification failure is never interpreted as transaction/query failure.

## 21. Current/history market-data Viewer

The existing Viewer currently renders latest/history by reading IndexedDB.

Target Browser SQL migration changes that boundary:

~~~text
Viewer
→ Runtime Controller request
→ SQL Authority read/query API
→ normalized Viewer model
~~~

Viewer itself still does not open DuckDB.

The exact market-history browsing SQL/API shape is an implementation decomposition item; this Phase fixes ownership and recovery semantics.

## 22. Acceptance scenarios

K-A1: Viewer attaches and immediately obtains a full current snapshot without waiting for the next broadcast/event.

K-A2: a state-change notification is deliberately dropped; manual sync returns correct current state.

K-A3: Viewer reloads and reconstructs state from Runtime Controller without direct DB access.

K-A4: Viewer closes; Recorder and query scheduler continue.

K-A5: two Viewer clients can observe the same runtime without creating extra SQL Workers/OPFS handles.

K-A6: Viewer A activates query version 12; Viewer B attempts activation with expected version 11 and receives stale-editor-state rather than overwriting 12.

K-A7: execution 42 fails after success 41; Viewer shows 42 as latest error while retaining preview 41 as latest successful result.

K-A8: a successful query returns 0 rows; Viewer presents successful empty result, not error.

K-A9: truncated preview visibly reports preview/full row counts when known and never claims completeness.

K-A10: runtime restarts; old in-memory preview is not presented as if owned by the new runtimeInstanceId.

K-A11: latest-success metadata survives reopen but preview payload is unavailable until a new successful execution; Viewer says so explicitly.

K-A12: current/history market-data browsing uses Controller/SQL Authority reads rather than direct Viewer DB ownership.

## 23. Deferred

Phase K does not define:

- exact visual styling/layout;
- numeric preview-row cap;
- detailed query-history UI;
- export of arbitrary query results;
- alerting/decision-engine integration;
- detailed test cases and CI split.

## 24. Completion result

~~~text
Viewer = detachable same-origin client
→ full state snapshot on attach
→ notifications are hints only
→ no direct DuckDB ownership
→ bounded latest-success preview in runtime memory
→ latest error kept separate from latest success
→ optimistic query activation across multiple Viewers
→ close/reload/restart recover through re-attachment
~~~