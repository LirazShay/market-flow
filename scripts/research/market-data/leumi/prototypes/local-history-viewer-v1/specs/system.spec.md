# MF-LHV-SYS-001 — Local History Viewer V1 System Specification

## Purpose

Local History Viewer V1 is a browser-only **market-data research instrument**.

Its immediate purpose is to continuously collect a complete local view of the available Leumi market-data universe, preserve historical snapshots safely in IndexedDB, and provide a same-origin viewer for current state, history, and diagnostics.

Its broader purpose is to establish reusable patterns for later Market Flow research tools:

- dynamic universe discovery;
- trustworthy complete-cycle collection;
- local historical persistence;
- separation of recorder and viewer responsibilities;
- explicit data-integrity gates;
- browser-local recovery;
- generated browser delivery from repository sources.

This is a research foundation, not a trading/execution engine.

Operational progress is tracked only in `../STATUS.json`.

## Scope

The system contract includes:

- browser execution on the intended Leumi origin;
- MapHeat2-based dynamic universe discovery;
- sequential GetSecuritiesData collection;
- complete-cycle validation;
- IndexedDB persistence;
- metadata-only cross-tab notification;
- a same-origin viewer;
- current table;
- deterministic sorting;
- per-security persisted history;
- recorder/viewer/storage diagnostics;
- generated runtime + Bookmarklet delivery;
- recovery from viewer close/reload and recorder restart.

The contract intentionally does not require:

- trade execution;
- server-side storage;
- external database;
- production deployment architecture;
- predictive trading logic;
- advanced filtering/charts/derived momentum metrics;
- automatic retention.

Future versions may add those capabilities, but must not silently weaken the data-integrity and source-of-truth invariants established here.

## Contract

The end-to-end contract is:

~~~text
real Leumi page/origin
→ discover current universe dynamically
→ collect every planned security through sequential chunks
→ validate exact cycle completeness
→ atomically persist the successful cycle
→ publish metadata-only commit notification
→ viewer rereads authoritative IndexedDB
→ render current/history/diagnostics
~~~

A successful cycle is not visible as successful until persistence commits.

The viewer does not receive or trust an in-memory market snapshot from BroadcastChannel.

The system must be restartable without deleting prior history.

The generated browser payload must come from repository sources; the Bookmarklet must not maintain a forked copy of business logic.

## Invariants

The following are system-level invariants:

1. **No hardcoded universe size.**
2. **Canonical security identifier:** `String(PaperId or Key)`.
3. **Complete means complete:** requested, received and unique counts match; no missing/duplicate/unexpected security identifiers.
4. **Raw evidence is preserved:** full MapHeat record in universe persistence and full GetSecuritiesData Security object in current/history persistence.
5. **`null != 0 != "" != undefined`**; values are not collapsed for convenience.
6. **IndexedDB is the durable browser source of truth.**
7. **BroadcastChannel is notification only.**
8. **Successful-cycle persistence is atomic across all market-state stores that must move together.**
9. **Failure cannot leave partial latest/history state.**
10. **Viewer reload/reopen recovers from IndexedDB, not from opener memory.**
11. **Generated delivery contains no secrets/session/account material.**
12. **Unknown API semantics are not invented.**
13. **Research evidence is classified as Verified / Inferred / Unknown where material.**
14. **Operational progress exists only in `STATUS.json`, not specs.**

## Failure semantics

A provider, validation, persistence, or viewer-read failure must be explicit.

For recorder-side failures:

~~~text
failure before successful atomic commit
→ no partial latest/history success
→ failure diagnostics may be persisted separately
→ recorder exposes failure
~~~

For messaging failure:

~~~text
BroadcastChannel unavailable/fails
→ IndexedDB remains authoritative
→ viewer startup/manual refresh remains usable
~~~

For viewer failure:

~~~text
DB/read/render failure
→ explicit viewer error state
→ do not present an empty/successful table as if the read succeeded
~~~

No failure path may fabricate data to preserve apparent continuity.

## Extension and reuse

Future Market Flow tools should treat the following as reusable concepts rather than accidental V1 implementation details:

- dynamic provider universe;
- canonical identifier boundary;
- collection completeness checks;
- complete-cycle object as a handoff boundary;
- atomic local persistence;
- recorder/viewer separation;
- notification-only cross-tab messaging;
- DB reread after notification;
- explicit diagnostics and evidence levels;
- generated self-contained browser runtime.

Future tools may replace:

- the UI;
- the storage engine;
- the provider adapter;
- the collection cadence;
- the packaging method;
- the browser-only architecture;

provided that any replacement defines equivalent or intentionally revised specs for integrity, consistency, failure behavior and source-of-truth ownership.

The tool should be mined for reusable responsibilities, not cloned blindly.

## Verification mapping

Executable evidence is split by the cheapest correct layer:

- pure validation/config/sorting/state logic → Node unit tests;
- IndexedDB, DOM, same-origin windows, BroadcastChannel and integration → Playwright/Chromium;
- current Leumi provider/session behavior → manual live verification.

Testing policy:

~~~text
../tests/TESTING_POLICY.md
~~~

The system-level mocked integration flow is covered by the integrated browser E2E spec.

Live-provider claims must not be promoted to Verified from mocked CI evidence alone.

## Change triggers

Review this spec whenever a change affects:

- system responsibilities or boundaries;
- source-of-truth ownership;
- high-level recorder→storage→viewer flow;
- canonical ID/data-integrity rules;
- successful-cycle commit semantics;
- failure/recovery behavior across components;
- inclusion/exclusion of major capabilities;
- reuse/evolution strategy;
- browser-only vs external architecture.

Component-only private refactoring that preserves every system contract may require no text change, but still requires SPEC impact review.

## References

- `../docs/requirements.md`
- `../docs/architecture.md`
- `../docs/data-model.md`
- `../docs/viewer-ux.md`
- `../tests/TESTING_POLICY.md`
- `../../../../../../../docs/leumi-api/README.md`
- `../../../../../../../docs/project/specification-policy.md`
- code areas: `../recorder/`, `../storage/`, `../messaging/`, `../viewer/`, `../runtime/`
