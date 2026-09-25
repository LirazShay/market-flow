# Browser SQL — Testing and Verification Strategy

This is the Phase L planning artifact for Local History Viewer V2.

It maps Browser SQL contracts to the cheapest valid verification layer, defines deterministic fixtures, Chromium coverage, authenticated-Leumi live gates and CI cadence.

It is planning only; no Browser SQL tests or harness are implemented in this phase.

Durable decision: ../../../../../../../docs/project/decisions/D-033.md

## 1. Testing principle

Use the cheapest layer that can prove the observable contract:

~~~text
pure deterministic behavior
→ Node unit tests

browser semantics / Worker / Wasm / OPFS / DOM / window lifecycle
→ Playwright + real Chromium

authenticated Leumi policy/provider behavior not reproducible faithfully in CI
→ explicit live verification
~~~

Do not mock away the very browser behavior a test is meant to prove.

## 2. Tests protect public contracts

Tests should target:

- accepted inputs/outputs;
- authority boundaries;
- persistence visibility;
- scheduler semantics;
- recovery behavior;
- Viewer synchronization;
- security rejection behavior;
- browser delivery behavior.

They should not lock private function names, internal queue layout, exact SQL statement ordering or implementation-only object shapes unless those details become public contracts.

## 3. Fast Node test scope

Node tests own deterministic logic that can be expressed without browser APIs.

Planned Browser SQL unit-test areas:

### Identity / data-model logic

- canonical SecurityId normalization;
- ingest_token creation contract and stable retry reuse;
- horizon list canonicalization;
- temporal predecessor target-time calculation;
- LAST percentage arithmetic/null cases;
- MID validity rule;
- source null/zero/empty/missing normalization semantics where represented in pure code;
- latest/current set-difference planning helpers.

### Complete-cycle validation

- exact requested/received/unique membership;
- duplicate/missing/unexpected rejection;
- defensive SQL-authority handoff validation;
- conflicting retry metadata under same ingest_token rejection.

### Scheduler logic

- anchored due-time calculation;
- independent collection/query cadence;
- no-overlap state machine;
- missed-tick coalescing;
- ingest-priority decision;
- restart/downtime coalescing;
- immutable query-version activation boundaries.

### Query safety/classification

- one analytical statement only;
- accepted statement classes;
- rejected DDL/DML/admin/config/transaction statements;
- parse/classification errors represented explicitly;
- no regex/prefix-only behavior hidden behind the public classifier contract.

Parser integration itself may require Chromium/Wasm if the chosen parser exists only there; pure policy decisions remain unit-tested independently.

### Viewer protocol/state

- runtimeInstanceId + stateRevision comparison rules;
- latest execution vs latest successful execution selection;
- stale-editor optimistic-concurrency rejection;
- preview/truncation presentation model;
- reconnect/disconnected state transitions;
- sanitized error-shape construction.

### Recovery decisions

- stale running session → interrupted;
- stale running query execution → interrupted;
- schema-version compatibility decisions;
- durability-uncertain reconciliation branches;
- quota/storage-blocked state transitions.

## 4. Chromium integration scope

Real Chromium is mandatory whenever correctness depends on browser semantics.

Planned spec clusters:

### engine-bootstrap.spec

Proves:

- generated runtime loads the pinned DuckDB main JS;
- Blob Worker creation;
- exact pinned Worker/Wasm selection;
- Wasm instantiation;
- capability/preflight failure classification;
- repeated launch reuses one SQL Authority;
- no silent fallback/version switching.

### opfs-persistence.spec

Proves with real OPFS:

- create/open persistent database;
- write transaction;
- CHECKPOINT;
- page/context reopen;
- same data still available;
- exact database identity reused;
- application readiness checks;
- no automatic destructive reset on incompatible/readiness failure fixtures.

### atomic-cycle-ingest.spec

Proves:

- one complete validated cycle becomes visible atomically;
- current_universe/latest/snapshot state advances together;
- injected failure before COMMIT leaves prior state only;
- derived enrichment failure rolls the entire attempted cycle back;
- dynamic universe add/remove behavior;
- raw source field preservation.

### ingest-idempotency-recovery.spec

Proves the acknowledgement ambiguity window:

~~~text
commit succeeds
→ simulated communication/Worker loss before caller acknowledgement
→ restart/reopen
→ same ingest_token retry
→ no duplicate cycle/snapshots
~~~

Also proves conflicting metadata under the same token fails explicitly.

### temporal-enrichment.spec

Proves against real DuckDB SQL:

- at-or-before horizon predecessor rule;
- jitter example: ~11s eligible for 10s;
- too-young history remains NULL;
- historical rows retain reusable predecessor links;
- LAST-change/null/zero-denominator behavior;
- DealsDelta remains disabled until its provider semantics gate is satisfied.

### sql-runtime.spec

Proves:

- SELECT/JOIN/GROUP BY/HAVING/window/ranking queries;
- arbitrary SQL version replacement;
- zero rows = success;
- query failure isolation;
- execution metadata traces exact query version;
- latest execution differs from latest successful execution;
- streamed result row counting;
- bounded preview + explicit truncation.

### scheduler-integration.spec

Uses controlled/fake clock boundaries where practical but real Worker/runtime coordination.

Proves:

- anchored cadence;
- no overlap;
- coalesced missed ticks;
- cycle commit priority over pending query;
- query sees only committed cycle state;
- runtime restart restores anchor and creates at most one pending catch-up execution.

### viewer-result-delivery.spec

Proves:

- attach gets full state snapshot immediately;
- dropped notification repaired by manual/full sync;
- Viewer reload re-attaches;
- runtime restart changes runtimeInstanceId;
- old in-memory preview is not presented as new-runtime state;
- multiple Viewers share one authority;
- stale query activation is rejected;
- closing Viewer does not stop Recorder/scheduler.

### runtime-security.spec

Proves in the pinned engine/browser build where technically observable:

- unsafe analytical SQL is rejected before mutation;
- required DuckDB hardening configuration is active;
- external-access attempts are rejected when external access is disabled;
- no provider credentials/session material appear in generated runtime fixtures/artifacts.

## 5. Deterministic fixture families

Fixtures must remain synthetic and sanitized.

Required families:

### Universe fixtures

- small dynamic universes of different sizes;
- membership add/remove;
- duplicate ID;
- missing ID;
- unexpected ID;
- canonical string IDs including values that would be unsafe to normalize numerically.

### Provider row fixtures

- full raw object with promoted fields;
- null field;
- numeric zero;
- empty string;
- missing property;
- nullable bid/ask;
- unknown future raw field preserved but not promoted.

### Temporal fixtures

- exact horizon;
- jitter just older than horizon;
- too-recent prior row;
- no history;
- zero denominator;
- multi-session history.

### Query fixtures

- simple SELECT;
- JOIN;
- GROUP BY/HAVING;
- window/ranking;
- zero-result query;
- syntax error;
- runtime error;
- unsafe DDL/DML/admin statement;
- large synthetic result to trigger preview truncation.

### Failure-injection fixtures

- failure before transaction;
- failure during snapshot insert;
- failure during enrichment;
- failure before/after COMMIT acknowledgement boundary;
- CHECKPOINT failure simulation where harness can inject it;
- Worker loss;
- page reload;
- schema mismatch;
- quota/storage failure;
- missed Viewer notification.

### CSP/capability fixtures

Controlled harness pages should model:

- Blob Worker allowed;
- Blob Worker blocked;
- remote Worker asset blocked;
- Wasm capability unavailable/failing;
- asset 404/version mismatch;
- OPFS capability absent or startup rejected.

These fixtures prove our failure handling, not the real bank CSP.

## 6. Existing fixture reuse

Reuse the current sanitized Leumi API fixture style where it proves provider shape/membership behavior.

Do not carry IndexedDB-specific setup into Browser SQL tests merely for familiarity.

Prefer new Browser SQL fixtures that express public cycle/query contracts rather than private storage internals.

## 7. Acceptance behavior traceability

| Acceptance | Primary proof | Supporting proof |
|---|---|---|
| AB-01 committed-cycle visibility | Chromium atomic-cycle-ingest + scheduler integration | Node transaction/state policy |
| AB-02 failed-cycle isolation | Chromium atomic-cycle-ingest | Node exact membership validation |
| AB-03 arbitrary SQL replacement | Chromium sql-runtime | Node query-version state |
| AB-04 independent cadence | Chromium scheduler integration | Node scheduler calculations |
| AB-05 zero-row success | Chromium sql-runtime | Node result-state mapping |
| AB-06 query error isolation | Chromium sql-runtime | Node state mapping |
| AB-07 overrun/no overlap | Chromium scheduler integration | Node coalescing logic |
| AB-08 refresh/reopen recovery | Chromium OPFS/recovery | Node recovery decisions |
| AB-09 raw future-field access | Chromium ingest + SQL query | fixture integrity unit test |
| AB-10 null/zero/empty/missing | Chromium roundtrip/query | Node normalization + fixture tests |
| AB-11 dynamic universe | Chromium atomic-cycle-ingest | Node membership validation |
| AB-12 startup horizon NULL | Chromium temporal-enrichment | Node predecessor-selection logic |
| AB-13 historical temporal reuse | Chromium temporal-enrichment | schema contract tests |
| AB-14 cross-security query | Chromium sql-runtime | none required |
| AB-15 secret boundary | artifact/static tests + Chromium runtime | Live review where needed |

## 8. Live authenticated-Leumi verification

Some requirements cannot be proven by deterministic CI because we do not control the bank page/origin/policy.

### Live Gate L-1 — Browser SQL compatibility probe

This is an implementation-entry gate and should occur before heavy Browser SQL implementation.

On the real authenticated Leumi page, prove in a minimal sanitized probe:

~~~text
1. Bookmarklet/injected JavaScript executes
2. Blob Worker can be created
3. exact pinned DuckDB Worker asset loads
4. exact pinned Wasm asset fetches/instantiates
5. SQL Worker can access the intended OPFS path
6. create/open test DuckDB database
7. create table + insert synthetic row
8. COMMIT + CHECKPOINT
9. refresh/relaunch runtime
10. reopen same DB
11. verify synthetic row exists
12. cleanly remove only the synthetic probe database if the probe owns it
~~~

No provider data, cookies, tokens, headers or account information are captured or committed.

If this gate fails because of real CSP/origin/browser constraints:

~~~text
stop dependent implementation work
→ record exact blocked capability
→ revisit runtime-delivery architecture explicitly
~~~

Do not build dozens of dependent implementation tasks on an unproven runtime premise.

### Live Gate L-2 — Provider compatibility

After Browser SQL collector integration exists, verify on authenticated Leumi:

- existing provider requests still succeed from the page context;
- dynamic universe and complete-cycle validation still match real responses;
- no new authentication path is required;
- runtime does not copy secrets into Worker/repository artifacts.

### Live Gate L-3 — End-to-end endurance checkpoint

Later, after benchmark and migration implementation, verify a representative live session for:

- repeated collection;
- SQL commits;
- scheduled queries;
- Viewer updates;
- refresh/reopen recovery;
- no obvious provider/session breakage.

This is not a substitute for deterministic tests.

## 9. CI topology

### Fast CI

Keep normal push/PR gate fast:

~~~text
npm run test:unit
~~~

Includes pure Browser SQL contracts and deterministic artifact/build checks that do not require Chromium.

### Browser CI

Keep Chromium CI separate from every-push Fast CI.

Browser CI is required when:

- Worker/Wasm/OPFS/browser-runtime code changes;
- Viewer/window/messaging integration changes;
- browser harness/fixture/test changes;
- storage/recovery integration changes;
- a numbered implementation Stage closes;
- release runtime is published.

During TDD/debugging use the exact target spec/test first.

Full Browser CI runs on the final Stage/checkpoint state and before runtime publication.

### Optional focused browser commands

Implementation should add stable scripts/tags for clusters such as:

~~~text
test:browser:sql-engine
test:browser:opfs
test:browser:scheduler
test:browser:viewer-sql
~~~

only when real test clusters exist. Do not add empty framework scripts during planning.

## 10. CI network discipline

Normal deterministic Browser CI should not depend on the live Leumi site or credentials.

For DuckDB engine assets, implementation has two acceptable verification modes:

1. deterministic local/checked test serving of the exact pinned artifacts for most Chromium tests;
2. a focused asset-delivery test that verifies the generated versioned URL/manifest behavior.

Do not make the entire Browser suite flaky because a public CDN is transiently unavailable.

Real CDN + Leumi policy remains part of Live Gate L-1.

## 11. OPFS test isolation

Each Playwright test/context that owns OPFS data must use a unique test database identity or isolated BrowserContext/origin state.

Cleanup rules:

- clean only databases created by the test;
- never rely on deleting the production logical database name in generic tests;
- if a test is specifically about reopen, preserve the same origin/context storage across the intentional reopen boundary;
- let BrowserContext teardown own ordinary final cleanup where possible.

## 12. Fault injection philosophy

Failure behavior should be tested through explicit harness injection points at public component boundaries, not by mutating private internals from tests.

Examples of acceptable seams:

- persistence command adapter returns injected failure;
- Worker transport drops acknowledgement after confirmed commit;
- asset server returns 404;
- notification transport drops one event;
- query executor returns controlled error.

These seams belong to test harness/adapters, not production-only backdoors.

## 13. Test data volume

Correctness tests use minimal datasets sufficient to prove behavior.

Do not turn ordinary CI into a performance benchmark.

Trading-session/multi-million-row performance belongs to Phase M benchmark strategy.

A small result-truncation fixture may be large enough to cross the configured preview threshold, but not benchmark scale.

## 14. Security verification

Automated checks should inspect generated artifacts/fixtures for forbidden secret patterns and verify that no runtime contract requires copied authentication material.

Live verification must never save real cookies/tokens/headers to GitHub Actions artifacts, screenshots, traces, debug bundles or repository files.

Where Playwright traces could expose synthetic request data, keep fixtures sanitized by construction.

## 15. Stage verification rule

During implementation:

~~~text
behavior/public contract
→ smallest relevant test
→ intended red when practical
→ implementation
→ exact target green
→ required Browser verification on final changed code
→ Fast CI
→ full Browser CI at numbered Stage closure
~~~

A Stage is not complete while required live-only verification is still unresolved; it remains verification-pending/blocked as appropriate.

## 16. Phase L completion result

The Browser SQL target now has a three-layer verification model:

~~~text
Node
= deterministic policy/state/data logic

Chromium
= real Worker/Wasm/OPFS/runtime/Viewer semantics

Live Leumi
= actual authenticated page CSP/origin/provider compatibility
~~~

Critical entry rule:

~~~text
minimal real-Leumi Worker/Wasm/OPFS probe
→ must pass before heavy dependent Browser SQL implementation proceeds
~~~