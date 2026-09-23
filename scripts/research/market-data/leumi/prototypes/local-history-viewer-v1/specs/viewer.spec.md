# MF-LHV-VIEW-001 — Viewer Specification

## Purpose

The viewer presents durable Local History Viewer state without becoming a second source of truth.

It gives a researcher a current table, deterministic sorting, per-security history, and recorder/storage diagnostics from IndexedDB.

Operational progress is tracked only in `../STATUS.json`.

## Scope

The viewer owns:

- same-origin viewer window lifecycle;
- startup/reload/reopen behavior;
- current table model/rendering;
- sorting;
- row activation;
- per-security history;
- continuation/load-older;
- diagnostics presentation;
- explicit sanitized Debug Bundle export action;
- BroadcastChannel-triggered DB reread;
- manual DB-only refresh;
- user-visible empty/error states;
- baseline accessibility.

The viewer does not own:

- provider fetching;
- recorder scheduling;
- durable market writes;
- trade execution;
- filtering/charts in the current V1 contract.

## Contract

### Same-origin window

The viewer opens/reuses a named child window:

~~~text
market-flow-leumi-v1-viewer
~~~

It must share the origin needed to access the same IndexedDB.

Repeated open may focus/reuse an existing viewer or open another same-origin viewer. Multiple viewer windows are acceptable because each rereads authoritative state from IndexedDB; repeated runtime launch must not start a duplicate recorder.

Reload/reopen must rebuild from persisted DB state.

### Viewer states

Viewer view state:

~~~text
BOOTING
EMPTY
MAIN
DETAIL
ERROR
~~~

Recorder health presentation:

~~~text
UNKNOWN
RUNNING
STALE
STOPPED
ERROR
~~~

These are distinct concerns.

### Current table

Current rows are built from:

~~~text
latest
+
universe
(join by canonical securityId)
~~~

A latest row must not disappear merely because corresponding universe metadata is missing.

The current table exposes stable V1 columns for identity, latest price/change, BID/ASK, activity/volume and collection time.

Default sort:

~~~text
DailyDealsQuantity DESC
~~~

Tie behavior remains deterministic.

String first-click sort is ascending; numeric/time first-click sort is descending.

Missing values sort deterministically and remain distinct internally.

### Display semantics

~~~text
null / undefined / empty string
→ —

0
→ 0
~~~

Formatting must not invent unit conversions or field semantics.

### Detail/history

Activating a row opens the selected security detail in the same viewer.

History:

- reads from IndexedDB;
- is isolated by canonical security ID;
- is newest-first;
- initially loads a bounded page;
- supports explicit older-page loading;
- must not duplicate or skip equal-timestamp rows across continuation boundaries.

Current main-table sort/viewport state should survive entering and returning from detail.

### Refresh

On `CYCLE_COMMITTED`:

~~~text
notification
→ reread IndexedDB
→ rerender while preserving appropriate UI state
~~~

Manual refresh:

~~~text
DB read only
~~~

It must never call the market-data provider.

### Debug export

The viewer header exposes:

~~~text
הורד קובץ Debug
~~~

The action delegates to the normal runtime Debug Bundle exporter.

It:

- does not start another recorder;
- does not call the market-data provider;
- downloads bounded sanitized JSON from already available runtime/IndexedDB evidence;
- disables itself while one export is in progress;
- reports the downloaded file name on success;
- reports a non-blocking visible error status on failure.

## Invariants

1. IndexedDB is the viewer data authority.
2. BroadcastChannel never supplies authoritative market rows.
3. Viewer startup works from existing DB state even without a currently running recorder.
4. Viewer reload/close/reopen does not require an in-memory opener snapshot.
5. Multiple viewer windows are allowed; they remain read-only views over the same IndexedDB authority and must not create additional recorders.
6. Missing universe metadata cannot silently drop valid latest rows.
7. `0` is displayed as zero, not as missing.
8. Sorting is deterministic and does not mutate persisted data.
9. Detail history is security-specific.
10. Paging/load-older produces no duplicate/skip at continuation boundaries.
11. Manual refresh is DB-only.
12. UI error states are explicit; failed reads are not rendered as successful emptiness.
13. Keyboard-visible focus and real interactive controls are preserved where defined.
14. The viewer is a research display, not a trading recommendation engine.
15. Debug export is observational and must not trigger provider collection or mutate persisted market state.

## Failure semantics

Empty DB:

~~~text
render explicit EMPTY state
~~~

DB/read failure:

~~~text
render ERROR state/banner
→ keep technical detail in diagnostics/console
→ do not fabricate rows
~~~

BroadcastChannel unavailable:

~~~text
startup still works
manual refresh still works
DB remains authoritative
~~~

History read failure must remain localized/visible; it must not corrupt current persisted state.

## Extension and reuse

Reusable viewer patterns include:

- same-origin recovery from browser DB;
- current materialized view + append-only history;
- UI state preservation across DB refresh;
- deterministic null-safe sorting;
- selected-entity drill-down;
- explicit diagnostic/health surface;
- notification-triggered reread rather than payload push.

Future tools may add filtering, charts, column configuration, derived metrics, exports, or different UI frameworks.

Those additions should build on the persisted-data contract rather than shifting market-data truth into ephemeral DOM state.

## Verification mapping

Pure current-table/state/diagnostics behavior:

~~~text
../tests/unit/current-table-logic.test.js
../tests/unit/viewer-state.test.js
../tests/unit/viewer-diagnostics-logic.test.js
~~~

Browser behavior:

~~~text
../tests/automation/specs/viewer-bootstrap.spec.js
../tests/automation/specs/viewer-current-table.spec.js
../tests/automation/specs/viewer-history-data.spec.js
../tests/automation/specs/viewer-security-detail.spec.js
../tests/automation/specs/viewer-diagnostics*.spec.js
../tests/automation/specs/viewer-live-refresh.spec.js
../tests/automation/specs/viewer-recovery.spec.js
../tests/automation/specs/integrated-v1-e2e.spec.js
../tests/automation/specs/debug-bundle.spec.js
~~~

## Change triggers

Review this spec whenever changing:

- viewer window/origin/reuse behavior;
- view/health state models;
- current-table join/columns/formatting;
- sorting semantics;
- missing/null/zero display;
- row activation/detail behavior;
- history query order/page size/continuation;
- refresh behavior;
- diagnostics;
- Debug Bundle export UI/status behavior;
- recovery;
- accessibility baseline;
- V1 UI scope.

## References

- `../docs/viewer-ux.md`
- `../docs/architecture.md`
- `../viewer/`
- `persistence.spec.md`
- `messaging.spec.md`
- `debug-bundle.spec.md`
- `../tests/TESTING_POLICY.md`
