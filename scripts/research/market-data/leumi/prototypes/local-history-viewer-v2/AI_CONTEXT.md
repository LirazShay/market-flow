# AI Context — Local History Viewer V1

Compact technical continuation context for a fresh chat.

Live progress / current Stage / exact next action live only in:

~~~text
STATUS.json
~~~

Default fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current Stage scope / target files / direct tests / owning SPEC as needed
~~~

Historical rationale is preserved and discoverable from:

~~~text
docs/history/README.md
~~~

Read history only when the current task needs to understand how/why the present state was reached.

## Architecture

~~~text
authenticated Leumi browser tab
→ Recorder
→ validated complete cycle
→ atomic IndexedDB persistence
   ├── meta
   ├── sessions
   ├── universe
   ├── cycles
   ├── latest
   └── history
→ metadata-only BroadcastChannel notification
→ same-origin Viewer
→ Viewer rereads IndexedDB
~~~

V1 is a browser-only research prototype. It does not choose the future production stack.

## Critical invariants

### Provider / data

- never hardcode universe size;
- verified join: `MapHeat2.PaperId == GetSecuritiesData.Key`;
- canonical security ID: `String(PaperId or Key)`;
- conservative verified chunk baseline: 187, configurable;
- chunk collection is sequential unless new evidence justifies change;
- preserve full raw MapHeat universe records;
- preserve full raw GetSecuritiesData Security objects;
- MapHeat2 + GetSecuritiesData are not one atomic provider snapshot;
- `null != 0 != "" != undefined`;
- do not infer unknown field semantics.

Provider evidence/details:

~~~text
../../../../../../docs/leumi-api/
~~~

### Persistence

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Successful cycle persistence is atomic across:

~~~text
cycles + history + latest + meta
~~~

Commit succeeds before the Recorder exposes successful completion in memory.

API / validation / DB failure must not leave partial `latest` or `history`.

### Viewer / messaging

- IndexedDB is source of truth.
- BroadcastChannel is notification only.
- channel: `market-flow-leumi-v1`.
- Viewer is same-origin.
- Viewer rereads IndexedDB after `CYCLE_COMMITTED`.
- manual DB-only refresh remains a fallback.
- missing universe metadata must not drop a valid latest row.
- BroadcastChannel-unavailable mode must not block startup/manual refresh.
- shared UI/state should have one authoritative owner/writer unless coordination is explicit.

### Runtime / version replacement

Normal delivery is the self-contained verified Bookmarklet/runtime.

For a new code version:

~~~text
refresh the Leumi page
→ run the new verified Bookmarklet
~~~

Do not build a permanent loader/hot-upgrade mechanism unless a future current requirement proves it necessary.

Refreshing the page does not intentionally delete the Market Flow IndexedDB database.

## Implementation map

~~~text
recorder/
    provider collection, cycle loop, diagnostics, pure logic

storage/
    IndexedDB schema/read/write, lifecycle, atomic successful-cycle persistence

messaging/
    BroadcastChannel adapter + pure message contract

viewer/
    bootstrap, current table, history/detail, refresh, diagnostics, pure UI logic

runtime/
    deterministic assembled runtime + Bookmarklet packaging

debug/
    bounded sanitized Debug Bundle

specs/
    durable responsibility contracts

tests/
    unit + Playwright + fixtures
~~~

## Task-to-context routing

Do not preload all of these.

| Task | Read when needed |
|---|---|
| current work / next action | `STATUS.json` |
| Stage scope/order | current Stage only in `ROADMAP.md` |
| recorder behavior | `specs/recorder.spec.md`, recorder files/tests |
| provider semantics | `specs/provider-data-contract.spec.md`, `docs/leumi-api/` |
| persistence | `specs/persistence.spec.md`, storage files/tests |
| messaging | `specs/messaging.spec.md` |
| viewer behavior | `specs/viewer.spec.md`, viewer files/tests |
| runtime packaging | `specs/runtime-delivery.spec.md`, runtime files/tests |
| Debug Bundle | `specs/debug-bundle.spec.md`, debug files/tests |
| test/verification rules | `tests/TESTING_POLICY.md` |
| E2E failure | `tests/E2E_DEBUGGING.md` |
| non-trivial refactor/design | `docs/project/engineering-practices.md` from repo root |
| unexpected failure learning | `docs/project/continuous-improvement.md` from repo root |
| past Stage/run/mini-project rationale | `docs/history/README.md` |
| durable cross-cutting rationale | `docs/project/decisions.md` from repo root |

## Verification summary

Use the cheapest valid test layer.

~~~text
pure deterministic
→ unit

browser behavior/integration
→ Chromium

provider-only semantics
→ live verification
~~~

After production/runtime/browser code changes, Chromium verification is required on the final changed state.

Expected TDD red may stay targeted; broad verification follows the workstream testing policy.

Detailed policy:

~~~text
tests/TESTING_POLICY.md
~~~

Do not copy live CI snapshots or current progress into this file.
