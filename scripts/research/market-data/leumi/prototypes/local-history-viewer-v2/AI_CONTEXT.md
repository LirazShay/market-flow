# AI Context — Local History Viewer V2

Compact technical continuation context for V2.

Live progress / current work / exact next action live only in:

~~~text
STATUS.json
~~~

Default fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current scope / target files / direct tests / owning SPEC as needed
~~~

## Origin

V2 was created from an exact Git tree clone of the frozen V1 workstream. V1 is preserved unchanged in:

~~~text
../local-history-viewer-v1/
~~~

Treat inherited V1 code/tests/specs as the implemented starting baseline. Do not assume the old V1 backlog defines V2 requirements.

Historical rationale remains discoverable from:

~~~text
docs/history/README.md
~~~

Read cold history only when the current task needs it.

## Current planning target

The implemented runtime is still the inherited IndexedDB baseline, but the active **planning target** is Browser-only SQL.

Durable decision:

~~~text
../../../../../../../docs/project/decisions/D-025.md
../../../../../../../docs/project/decisions/D-026.md
../../../../../../../docs/project/decisions/D-027.md
../../../../../../../docs/project/decisions/D-028.md
../../../../../../../docs/project/decisions/D-029.md
~~~

Selected target boundary:

~~~text
authenticated Leumi page
→ Recorder / Collector
→ Runtime Controller
→ dedicated SQL Authority Worker
   → DuckDB-Wasm
   → persistent OPFS DuckDB database
   → atomic successful-cycle commits
   → active SQL scheduler + query execution
→ Runtime Controller
→ Viewer client(s)
~~~

DuckDB-Wasm + OPFS is now the selected planning target inside a single dedicated SQL Authority Worker. Exact package version and implementation suitability remain later verification work.

localhost / Node / .NET / native database architecture is outside the current planning scope. Reopening that boundary requires a future explicit architecture decision.

This workstream is currently in a planning-only project. Do not implement Browser SQL until STATUS/ROADMAP advance to implementation handoff.

## Selected relational model

~~~text
security + current_universe
cycle
snapshot
  + full raw Security JSON
  + promoted typed analytical fields
  + prev_H_snapshot_id / last_change_H_pct / deals_delta_H for core horizons
latest_snapshot → pointer to authoritative snapshot
~~~

Canonical IDs:

~~~text
security_id = VARCHAR / String(PaperId or Key)
snapshot_id = stable BIGINT surrogate
UNIQUE(cycle_id, security_id)
~~~

Canonical Market Flow timestamps remain epoch milliseconds. Source missing/null/zero/empty distinctions remain recoverable from raw JSON; promoted SQL NULL alone is not used to infer source presence.

## Selected ingest / atomicity contract

~~~text
complete validated cycle
→ immutable handoff with exact validated universe
→ SQL Authority defensive validation
→ one bulk cycle operation
→ set-based temporal/derived enrichment
→ one SQL transaction
→ COMMIT
→ success acknowledgement
~~~

Temporal predecessor rule for horizon H: choose the latest same-security snapshot with `collected_at_ms <= current.collected_at_ms - H*1000`; if none exists, use NULL. current_universe and latest_snapshot advance only inside the same successful transaction.

## Selected SQL execution / scheduler contract

~~~text
immutable query version
→ parser-level read-only analytical gate
→ fixed cadence anchored to activation
→ no overlapping query executions
→ missed ticks coalesce
→ validated cycle commit outranks pending query
→ streamed result accounting
→ latest execution kept distinct from latest successful execution
~~~

Collection cadence and query cadence remain independent. Hard query cancellation is not assumed until verified in the exact pinned DuckDB-Wasm package.

## Implemented baseline architecture

~~~text
authenticated Leumi browser tab
→ Recorder
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ same-origin Viewer
→ Viewer rereads IndexedDB
~~~

## V2 identity isolation

~~~text
database       market-flow-leumi-history-v2
channel        market-flow-leumi-v2
viewer window  market-flow-leumi-v2-viewer
viewer marker  market-flow-leumi-v2
runtime        market-flow-v2.runtime.js
bookmarklet    market-flow-v2.bookmarklet.txt
~~~

The internal browser globals are still inherited as `window.MarketFlow*`. V1 and V2 must not both be injected into the same browsing context without refresh. Separate tabs remain isolated by persistent/runtime identity.

## Inherited critical invariants

Until V2 deliberately changes a contract:

- never hardcode universe size;
- canonical security ID is `String(PaperId or Key)`;
- preserve full raw MapHeat and GetSecuritiesData Security objects;
- preserve `null != 0 != "" != undefined`;
- do not infer unknown provider field semantics;
- complete-cycle validation precedes persistence;
- successful cycle persistence is atomic across `cycles + history + latest + meta`;
- API / validation / DB failure must not leave partial `latest` or `history`;
- IndexedDB remains source of truth and BroadcastChannel remains notification-only **for the currently implemented baseline until an intentionally specified migration changes authority**.

## Implementation map

~~~text
recorder/   provider collection + cycle loop
storage/    IndexedDB schema/read/write + atomic persistence
messaging/  BroadcastChannel contract
viewer/     current/history UI + diagnostics
runtime/    generated runtime + Bookmarklet
debug/      sanitized Debug Bundle
specs/      implemented baseline contracts
tests/      unit + Playwright + fixtures
~~~

## Planning map

~~~text
ROADMAP.md
→ planning phases/order

docs/browser-sql-current-state-audit.md
→ current baseline / retain-replace-gap evidence

docs/browser-sql-requirements-and-acceptance.md
→ consolidated requirements / classifications / end-to-end acceptance behaviors

docs/browser-sql-browser-constraints.md
→ Browser/Windows/Chromium/origin/lifecycle/persistence/loading/concurrency constraints and research questions

docs/browser-sql-official-capability-research.md
→ current official DuckDB-Wasm/OPFS/Worker/Arrow/memory capability evidence and remaining unknowns

docs/browser-sql-target-architecture.md
→ selected single-authority Worker topology and startup/ingest/query/recovery flows

docs/browser-sql-relational-data-model.md
→ selected Cycle/Snapshot/security/latest/raw+typed/wide-horizon relational model

docs/browser-sql-ingest-enrichment-atomicity.md
→ validated-cycle handoff, bulk ingest boundary, enrichment order, temporal predecessor rule and one-transaction commit contract

docs/browser-sql-execution-scheduler.md
→ immutable query versions, read-only SQL gate, anchored cadence, no-overlap/coalescing and result/failure semantics

docs/sql-live-analytics-design.md
→ durable design direction

docs/sql-live-engine-benchmark-plan.md
→ benchmark planning requirements
~~~

## V2 change rule

For future V2 behavior changes:

~~~text
requirement / observable contract
→ affected SPEC review
→ tests first when practical
→ implementation
→ required verification
→ STATUS.json update
~~~

During the current planning project, documentation/research/design may change, but production/runtime implementation must not begin.

Do not modify frozen V1 merely to make V2 development easier.
