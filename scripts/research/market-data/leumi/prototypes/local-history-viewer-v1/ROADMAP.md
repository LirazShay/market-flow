# Roadmap — Local History Viewer V1

This file defines **scope and order only**.

Operational progress does **not** live here.

Authoritative current status:

~~~text
STATUS.json
~~~

Fast AI context:

~~~text
AI_CONTEXT.md
~~~

Rule:

~~~text
ROADMAP.md = what/why/order
STATUS.json = current/next/completed/pending
~~~

This prevents duplicated status markers from drifting out of sync.

# Stage index

~~~text
1  Requirements + architecture
2  Data model / IndexedDB schema
3  Viewer UX plan
4  Test plan
5  IndexedDB module
6  Test infrastructure + IndexedDB self-tests
7  Recorder skeleton
8  Persistence integration
9  Recorder diagnostics
10 Viewer bootstrap
11 Current table from IndexedDB
12 Cross-tab live refresh
13 Dynamic sorting
14 Security history drill-down
15 Viewer diagnostics
16 Reload and recovery
17 Failure simulation
18 Storage growth test
19 Integrated V1 validation
20 V1 freeze
~~~

For completion/progress, always read `STATUS.json`.

---

# Planning

## Stage 1 — Requirements + architecture

Outputs:

~~~text
README.md
docs/requirements.md
docs/architecture.md
ROADMAP.md
~~~

Defines V1 boundaries and browser-only architecture.

## Stage 2 — Data model / IndexedDB schema

Output:

~~~text
docs/data-model.md
~~~

Defines:

- six IndexedDB stores;
- keys/indexes;
- full raw-field preservation;
- transaction boundaries;
- time model;
- no-retention V1 policy.

## Stage 3 — Viewer UX plan

Output:

~~~text
docs/viewer-ux.md
~~~

Defines current table, history detail, sorting, live-update behavior and diagnostics.

## Stage 4 — Test plan

Output:

~~~text
docs/test-plan.md
~~~

Substeps:

~~~text
4.1 Storage/schema cases
4.2 Write/atomicity cases
4.3 Viewer/sorting/history cases
4.4 Cross-tab/reload/recovery cases
4.5 Storage-growth/integrated cases
~~~

---

# Implementation foundation

## Stage 5 — IndexedDB module

Substeps:

~~~text
5.1 Schema constants
5.2 Open/close connection
5.3 Version 1 schema creation
5.4 Generic read helpers
5.5 Generic write helpers
~~~

Implementation location:

~~~text
storage/
~~~

Atomic full-cycle persistence is intentionally deferred to Stage 8.

## Stage 6 — Test infrastructure + IndexedDB self-tests

Goal:

~~~text
manual browser self-tests
+
automated Chromium CI
~~~

### 6.1 — Schema/open browser self-test

Checks:

- DB open/upgrade;
- database name/version;
- stores;
- keyPath/autoIncrement;
- indexes.

### 6.2 — Fixture write/read round-trip

Checks:

- add/put;
- get/getAll/count;
- null/zero/empty-string preservation.

### 6.3 — Cleanup + reopen persistence

Checks:

- targeted fixture cleanup;
- close/reopen;
- schema remains valid;
- fixture remains deleted.

### 6.4 — Playwright browser-test harness

Build test tooling:

- package/test scripts;
- Playwright config;
- Chromium runner;
- local harness/page loading browser modules.

Node/Playwright are test tooling only, not a production-stack decision.

### 6.5 — GitHub Actions CI workflow

Workflow should:

- install dependencies;
- install Chromium;
- run browser tests;
- fail on test failure;
- retain useful failure report/artifact.

No Leumi session/secrets.

### 6.6 — Automate existing storage self-tests

Run 6.1–6.3 automatically inside real Chromium IndexedDB.

### 6.7 — Mock API fixture infrastructure

Provide deterministic sanitized fixtures/interception for:

~~~text
MapHeat2
GetSecuritiesData
~~~

Cover at least:

- successful universe;
- successful chunks;
- null/zero;
- duplicate/missing data;
- HTTP failure;
- invalid response structure.

No live Leumi calls in CI.

---

# Recorder

## Stage 7 — Recorder skeleton

### 7.1 — Module skeleton + configuration

Defines:

- target cadence;
- chunk delay;
- chunk size;
- universe-refresh policy;
- config validation.

### 7.2 — Universe loader

Implements:

- MapHeat2 count;
- full universe;
- PaperId validation;
- dynamic chunk planning.

### 7.3 — Single chunk fetch

Implement:

- one GetSecuritiesData request;
- response validation;
- chunk timing metadata.

### 7.4 — Single complete cycle builder

Combine chunks sequentially into one validated in-memory cycle object.

No DB writes yet.

### 7.5 — Recorder loop shell

Add:

- start/stop;
- target cadence;
- no-overlap scheduling;
- in-memory latest cycle/error state.

### 7.6 — Recorder mocked browser tests

CI coverage:

- dynamic universe size;
- chunk planning;
- sequential execution;
- full-cycle completeness;
- duplicate/missing rejection;
- HTTP/error propagation;
- no-overlap scheduling;
- start/stop.

---

# Persistence

## Stage 8 — Persistence integration

Connect the verified Stage 7 recorder to IndexedDB.

Substeps:

~~~text
8.1 Persistence record builders/contracts

8.2 Session + universe persistence
    sessions + meta
    universe + meta

8.3 Atomic successful-cycle transaction
    cycles + history + latest + meta
    one IndexedDB readwrite transaction

8.4 Recorder integration + persistence failure/rollback tests
~~~

Why session/universe are included here:

- persisted cycle/history rows require a valid `sessionId`;
- the future viewer needs persisted universe metadata for joins;
- both responsibilities are already part of the durable `docs/data-model.md` transaction model.

Critical invariant:

~~~text
validated in-memory cycle
→ one atomic DB commit succeeds
→ only then recorder exposes success/latest state
~~~

Do not compose separate single-store helper calls to simulate the atomic full-cycle commit.

Required automated integration coverage:

- session creation and binding;
- universe persistence with full raw MapHeat preservation;
- successful atomic commit;
- generated cycleId used consistently by history/latest/meta;
- latest/history consistency;
- second cycle replaces latest while preserving history;
- rollback on injected transaction failure;
- DB commit failure is surfaced as recorder failure;
- failed API/validation cycle leaves latest/history unchanged;
- failed-cycle persistence never writes partial latest/history;
- full raw GetSecuritiesData field preservation;
- null/zero/empty distinctions remain intact.

## Stage 9 — Recorder diagnostics

Add:

- heartbeat;
- recorder state;
- failures;
- counters;
- storage estimate.

---

# Viewer

## Stage 10 — Viewer bootstrap

Open/load a same-origin viewer shell.

## Stage 11 — Current table from IndexedDB

Load `latest` and display current securities.

## Stage 12 — Cross-tab live refresh

Add BroadcastChannel notification handling plus fallback refresh behavior.

## Stage 13 — Dynamic sorting

Clickable headers, ASC/DESC, deterministic null-safe sorting.

## Stage 14 — Security history drill-down

Row → per-security history table from IndexedDB.

## Stage 15 — Viewer diagnostics

Show:

- recorder status;
- last cycle;
- DB row counts;
- storage usage.

Automated viewer coverage should include:

- current table;
- default/dynamic sorting;
- null/zero rendering;
- row → detail;
- isolated per-security history;
- paging/load older;
- sort-state preservation;
- empty/error/stale;
- BroadcastChannel refresh;
- reload/close/reopen;
- multiple viewers where practical.

---

# Resilience / validation

## Stage 16 — Reload and recovery

Verify:

- viewer reload;
- close/reopen;
- recorder independence;
- persisted-state restoration.

## Stage 17 — Failure simulation

Mocked CI cases:

- failed API chunk;
- invalid response;
- duplicate/missing securities;
- failed validation;
- DB write failure;
- stale recorder;
- BroadcastChannel degraded/unavailable.

Live recovery checks come only after CI passes.

## Stage 18 — Storage growth test

Measure actual:

~~~text
rows/minute
MB/minute
bytes/history-row
estimated hours before concern
~~~

No automatic retention in V1.

## Stage 19 — Integrated V1 validation

### 19.1 — Full mocked E2E in GitHub Actions

~~~text
Recorder
→ IndexedDB
→ BroadcastChannel
→ Viewer
→ sorting
→ history
~~~

CI must pass before runtime packaging and live verification.

### 19.2 — Runtime assembly + Bookmarklet packaging

This is a hard prerequisite before any live Leumi verification.

Goal:

~~~text
existing verified modules
→ deterministic assembly/build step
→ one runnable browser payload
→ Bookmarklet-compatible entry point
→ real Leumi page launch
~~~

The project must not require a user to manually paste or load many source files in dependency order.

Plan and implement a reproducible delivery mechanism that:

- assembles the recorder, storage, messaging and viewer modules in the correct dependency order;
- produces a single browser-runnable payload from the repository sources;
- produces a Bookmarklet-compatible launcher/entry point;
- remains idempotent/recoverable when launched again;
- does not duplicate or fork business logic into a second implementation;
- does not embed credentials, cookies, tokens, authorization headers, account data or private session state;
- preserves same-origin IndexedDB/viewer behavior required by V1;
- has automated build/package verification and a browser smoke test before live use;
- documents exactly how to generate and use the runnable output from source.

Prefer generated output from source over maintaining a large hand-copied Bookmarklet separately.

Live verification is blocked until this stage is complete and verified.

### 19.3 — Live Leumi browser verification

Against the real browser session, using the verified runtime assembly/Bookmarklet delivery path from Stage 19.2:

- real MapHeat2/GetSecuritiesData behavior;
- recorder persistence;
- viewer behavior;
- assembly/launch behavior on the real site;
- Verified/Inferred/Unknown outcomes.

### 19.4 — Long-run live report

Run the assembled recorder + viewer for an extended period and save a reproducible report beside the prototype.

## Stage 20 — V1 freeze

Finalize:

- README;
- verified behavior;
- known limitations;
- cleanup;
- version marker.

---

# V2 backlog — intentionally excluded from V1

- filtering;
- multi-column filters;
- saved filter presets;
- derived momentum metrics;
- charts;
- column chooser/reorder;
- retention policy;
- export/import;
- worker/background processing;
- advanced history queries.

V2 begins only after V1 is stable and verified.
