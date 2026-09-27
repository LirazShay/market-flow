# Browser SQL V2 — V1-on-SQL Implementation Manual

> **Reference-only / superseded implementation guidance.** Current V1-on-SQL ownership is C02..C06 under D-044 and the compact Issue specifications. The ND-* sequence below is planning rationale, not an implementation instruction.


## Role

This is Pass E1 of Issue #72.

It is the implementation manual for the first major Browser SQL mini-project:

~~~text
preserve the proven V1 collector contract
→ replace IndexedDB market persistence with SQL Authority
→ expose trusted SQL reads
→ preserve Current Universe
→ preserve Security Detail/History
→ prove V1-on-SQL parity
~~~

This document is planning-only. It does not implement runtime/product code and does not mutate the canonical GitHub Issue graph.

Dependency authority: `browser-sql-rebaseline-dependency-dag.md`, Pass D3.

## 1. Hard boundaries

This mini-project includes ND-01..ND-16 plus only the benchmark scaffolding/baselines needed to support later work.

It explicitly does **not** implement:
- temporal horizons or derived analytical metrics;
- Dynamic SQL Scanner;
- final production cutover;
- archive/rollover unless later capacity evidence promotes it;
- generalized future-upgrade machinery;
- trade selection, order execution or a final trading formula.

V1 acquisition behavior remains the provider baseline:

~~~text
authenticated Leumi page
→ MapHeat2 dynamic universe
→ sequential GetSecuritiesData chunks
→ exact complete-cycle validation
→ one validated complete cycle
~~~

## 2. Existing repository surfaces to preserve/reuse

Before each implementation unit, read the latest relevant files rather than copying old assumptions.

Primary existing code surfaces:
- `recorder/universe-loader.js`;
- `recorder/securities-chunk-fetcher.js`;
- `recorder/cycle-builder.js`;
- `recorder/recorder-loop.js`;
- `storage/` V1-derived persistence/read code as behavior reference only;
- `runtime/build-runtime.js`, `runtime/entry.js`, `runtime/source-order.js`;
- `viewer/current-table.js`, `viewer/history-data.js`, `viewer/security-detail.js`, `viewer/live-refresh.js`;
- `messaging/channel.js` as notification-behavior reference;
- `specs/provider-data-contract.spec.md`, `recorder.spec.md`, `viewer.spec.md`, `persistence.spec.md`.

Existing test surfaces to reuse/extend rather than duplicate blindly:
- unit collector/universe/chunk/cycle tests;
- `mock-leumi-api.spec.js`;
- `successful-cycle-persistence.spec.js`;
- `persistence-lifecycle.spec.js`;
- `recorder-persistence-integration.spec.js`;
- Viewer current/history/detail/live-refresh/recovery specs;
- `integrated-v1-e2e.spec.js`;
- Browser SQL probe/P0C tests.

## 3. Work-unit execution discipline

For every implementation unit:

~~~text
1. read current source/spec/tests
2. update STATUS.json → in-progress for the unit
3. define/confirm observable contract
4. add or update tests first where practical
5. confirm intended new test fails for the right reason
6. implement the smallest coherent change
7. run affected Node tests
8. run every modified/added Playwright test in Chromium
9. run broader Browser coverage when storage/runtime/viewer integration changed
10. inspect failures; retain the smallest useful regression
11. STATUS → verification-pending before required checkpoint CI
12. only after green verification mark unit complete and advance pointer
~~~

No unit may silently weaken provider validation, atomicity, raw preservation, null semantics or recovery to make a test pass.

## 4. E1-A — Verification core [ND-01]

### Start

Can begin immediately using PRE-01/PRE-02.

### Tests / contracts first

Define tests/guards for:
- evidence artifact identity: commit/build/browser/OS/fixture version;
- PASS/FAIL plus Verified/Inferred/Unknown;
- forbidden secret/session patterns;
- temporary-POC disposition metadata;
- public-boundary fault-injection registration conventions.

### Implement

Build only shared verification plumbing needed by this mini-project. Do not build Scanner-specific fixtures or future benchmark suites yet.

### Exit

- evidence schema is machine-readable;
- sanitization guard is automated;
- fixtures can be versioned without private live dumps;
- PRE-01/PRE-02 evidence remains valid and referenced rather than duplicated.

## 5. E1-B — V1 collector characterization [ND-02]

### Start

Can run in parallel with E1-A after the existing V1/V2 recorder sources are read.

### Tests first

Create/extend deterministic tests proving:
- MapHeat2 drives universe membership;
- no hardcoded universe count;
- canonical ID is `String(PaperId or Key)`;
- sequential chunk plan/order;
- requested/received/unique/duplicate/missing/unexpected accounting;
- malformed response is failure;
- full raw MapHeat and Security objects survive the validated-cycle boundary;
- null, zero, empty string and missing remain distinguishable;
- provider/validation failure never becomes successful persistence input;
- collection cycles do not overlap in the proven baseline.

Use sanitized synthetic fixtures only.

### Exit

The inherited collector has an executable observable contract that later SQL integration must preserve.

## 6. E1-C — Self-verifying real-origin SQL gate L-1 [ND-03]

### Start

Requires PRE-01/PRE-02 and the minimal verification artifact format from E1-A.

### Implement the verifier, not production persistence

The live artifact must automatically prove on the authenticated Leumi origin:
- bootstrap/injection succeeds;
- Blob Worker succeeds;
- exact pinned Worker/Wasm assets load;
- OPFS probe DB opens;
- synthetic write + COMMIT + CHECKPOINT succeed;
- Worker/runtime teardown and reopen recover the probe marker;
- controlled same-origin context can verify required primitive behavior that truly belongs to this gate;
- cleanup touches only probe-owned storage;
- output is sanitized machine-readable PASS/FAIL.

Cross-tab production ownership is not allowed to block SQL feasibility here; that belongs to ND-28 later.

### Human boundary

The user may need only to launch the artifact inside the authenticated session. The artifact performs and judges assertions.

### Exit gate

`PASS` is required before heavy production SQL-authority implementation. `FAIL/Unknown` reopens runtime-delivery design; do not continue by assumption.

## 7. E1-D — Minimum SQL Authority + schema [ND-04]

### Start

Only after L-1 passes.

### Behavior/tests first

Chromium tests should define:
- one SQL Authority Worker owns DuckDB/OPFS inside one runtime;
- Controller reports explicit BOOTING/READY/FAILED or equivalent states;
- Recorder cannot persist before READY;
- reopen never silently resets an unreadable/incompatible DB;
- schema identity is explicit;
- minimum tables/structures represent session, cycle, current universe, stable snapshot identity, raw MapHeat, raw Security, latest/current pointer and ingest-token foundation.

### Implementation boundary

Use the existing `runtime/` and `storage/` ownership pattern where practical. Do not preserve IndexedDB APIs merely for familiarity.

Do not add enrichment columns or Scanner state.

### Exit

A synthetic Chromium page can create/reopen the minimum SQL authority and report truthful readiness/failure.

## 8. E1-E — Validated-cycle handoff + bulk staging [ND-05]

### Start

Requires collector characterization and minimum SQL Authority.

### Tests first

Feed the characterized validated-cycle fixture into the SQL boundary and assert:
- stable `ingest_token` assigned before handoff;
- requested/received/unique counts agree;
- no duplicate/missing/unexpected IDs accepted;
- source timing preserved;
- full raw objects preserved;
- one complete-cycle transfer, not per-security page↔Worker SQL chatter;
- conflicting retry token/immutable metadata is integrity failure.

### Exit

The only normal production ingest input to SQL is one already-complete validated cycle with a stable idempotency identity.

## 9. E1-F — Atomic raw/current/history persistence [ND-06]

### Tests first

Add permanent Chromium fault-injection cases around public persistence seams:
- fail before transaction;
- fail during staging;
- fail after some history rows;
- fail after some current/latest work;
- fail before COMMIT.

Every failure must leave the previous committed state coherent and expose none of the attempted successful cycle.

### Implement

Within one transaction persist, at minimum:

~~~text
cycle metadata
history snapshots
current universe
latest/current pointers
required raw facts
~~~

Do not include enrichment.

### Exit

One COMMIT advances the whole raw/current/history cycle coherently or nothing becomes successful.

## 10. E1-G — Durability, acknowledgement and idempotent recovery [ND-07]

### Tests first

Cover:
- COMMIT succeeds then acknowledgement transport is lost;
- same ingest token retried;
- CHECKPOINT fails after COMMIT;
- Worker dies before acknowledgement;
- runtime reopens after unclean shutdown;
- conflicting token metadata;
- storage/quota failure;
- readiness failure.

### Implement

Durable-success boundary:

~~~text
COMMIT
→ CHECKPOINT
→ durable-success acknowledgement
~~~

On ambiguity, reconcile by ingest token before retry. Never blindly insert twice.

### Exit

- no duplicate committed cycles;
- no false durable acknowledgement;
- uncertain durability is explicit;
- recovery never deletes/recreates production storage automatically.

## 11. E1-H — Persistence foundation checkpoint [ND-08]

This is a checkpoint, not another feature.

Required automated evidence:
- exact complete-cycle handoff;
- dynamic-universe changes;
- raw MapHeat/Security preservation;
- null/zero/empty/missing;
- atomic current/history/latest;
- transaction fault injection;
- COMMIT/CHECKPOINT acknowledgement;
- lost-ack retry;
- Worker/runtime reopen;
- storage/readiness failure behavior.

Required verification:
- Fast CI green;
- all affected Chromium specs green;
- full Browser suite because the storage/runtime foundation has changed coherently;
- evidence artifact tied to exact commit/build.

Only after this checkpoint may the SQL storage authority be called proven.

## 12. E1-I — Production runtime packaging [ND-09]

### Start

Packaging infrastructure may begin after ND-04; final package verification uses the current durable implementation.

### Tests first

Guard:
- deterministic generated runtime;
- exact Worker/Wasm identities;
- no hand-edited output;
- source order reproducibility;
- no secret/session material;
- repeated same-tab launch behavior remains deterministic.

### Exit

The candidate used by Recorder/L-2 is the same generated production-shaped artifact that CI identifies and tests.

## 13. E1-J — Trusted SQL read contracts [ND-11]

### Start

May begin after atomic COMMIT behavior exists; it does not need to wait for final durability policy.

### Define contract before UI

Semantically own:

~~~text
getCurrentUniverse()
getSecurityCurrent(SecurityId)
getSecurityHistoryPage(SecurityId, cursor, limit)
getMarketHealthSnapshot()
~~~

Names may differ, semantics may not.

### Tests first

Prove:
- reads see only committed state;
- Current contains exactly latest complete-universe membership;
- missing optional MapHeat metadata cannot drop a valid latest row;
- a security leaving Current keeps history;
- canonical ID joins, never array position;
- stable total history order uses timestamp plus stable tie-breaker;
- continuation has no duplicate/skip with equal timestamps;
- empty success differs from read failure;
- not-current differs from unknown/no-history;
- bounded pages;
- null/zero/empty preserved.

### Exit

Viewer code can depend on stable application reads without knowing DuckDB table layout.

## 14. E1-K — Shared Viewer shell / runtime bridge / health [ND-12]

### Tests first

Automate:
- Viewer opens after runtime already has committed data;
- missed notification;
- Viewer reload;
- Viewer close/reopen;
- two Viewer clients;
- runtime restart/reattach;
- shared runtime/storage failure versus surface-local read failure;
- manual refresh causes only authoritative reread.

### Implement

Preserve the V1 principle:

~~~text
notification = hint
trusted runtime read = truth
~~~

Define shared shell/runtime state separately from Current and Detail state.

Prepare navigation shell for the future Scanner, but do not implement Scanner behavior.

### Exit

Viewer attachment/recovery no longer depends on direct IndexedDB ownership or historical notifications.

## 15. E1-L — Current Universe surface [ND-13]

### Tests first

Use the parity corpus to cover:
- all current securities;
- relevant V1 bank fields;
- default `DailyDealsQuantity DESC` behavior and deterministic tie handling where still canonical;
- interactive numeric/string sorting;
- deterministic null ordering;
- null/undefined/empty displayed as missing while zero displays as zero;
- committed-cycle live refresh;
- DB/runtime-only manual refresh;
- sort/viewport preservation;
- Hebrew/RTL and keyboard-visible controls.

### Implement

Change data source only:

~~~text
V1 direct IndexedDB read
→ trusted SQL read contract
~~~

Do not add Scanner filtering/ranking here.

### Exit

Current Universe is behaviorally equivalent on the SQL authority for the preserved V1 contract.

## 16. E1-M — Security Detail/History surface [ND-14]

### Tests first

Cover:
- Current row → canonical SecurityId detail;
- selected-security current summary;
- newest-first bounded history;
- explicit load older;
- equal-timestamp cursor boundaries;
- no duplicate/skip;
- live refresh while remaining in Detail;
- Back restores useful Current state;
- selected security leaves current universe but history remains visible;
- history read failure stays local and does not corrupt Current.

### Implement

Reuse one Detail/History capability that the future Scanner can navigate to later.

### Exit

Detail/History parity is proven independently from Scanner.

## 17. E1-N — Inherited Recorder → SQL integration [ND-10]

### Start

Requires characterized collector, durable SQL ingest boundary and production-shaped runtime.

### Tests first

Extend mocked-browser integration so the normal recorder path proves:
- same MapHeat2 universe behavior;
- same sequential GetSecuritiesData flow;
- same validation result;
- failed cycle not persisted;
- successful validated cycle waits for SQL durable acknowledgement;
- one pending validated cycle maximum while persistence is blocked;
- no provider call is caused by Viewer refresh.

### Implement

Replace only the successful-cycle persistence handoff.

Do not redesign endpoints/chunking/field interpretation.

### Exit

The normal Recorder produces the same validated cycle and receives SQL durable acknowledgement instead of IndexedDB success.

## 18. E1-O — Self-verifying live provider compatibility gate L-2 [ND-15]

### Implement verifier

Run the production-shaped candidate in the authenticated page and automatically judge:
- MapHeat2 success;
- dynamic membership/count accounting;
- sequential GetSecuritiesData behavior;
- requested/received/unique/missing/unexpected integrity;
- raw handoff preservation checks that can be safely asserted;
- canonical IDs;
- SQL durable acknowledgement;
- no auth/session data copied into Worker/evidence.

Do not retain private raw provider dumps.

### Exit

Sanitized machine-readable L-2 PASS tied to exact commit/build. Human judgement is not part of acceptance.

## 19. E1-P — V1-on-SQL parity harness [feeds ND-16]

Build the durable migration comparison suite around the same sanitized scenario corpus.

Compare public/observable behavior, not storage internals:

~~~text
collector outcome
current membership/values
history membership/order
sorting/display semantics
detail navigation
paging
refresh
reload/reopen
failure/non-commit behavior
~~~

Do not compare IndexedDB key layout with DuckDB table layout.

Important fixture families:
- security enters/leaves universe;
- missing optional universe metadata;
- null/zero/empty/missing;
- equal timestamps;
- repeated cycles;
- failed/partial cycle;
- commit/ack retry ambiguity.

## 20. E1-Q — V1-on-SQL product checkpoint [ND-16]

The mini-project exits only when this product statement is proven:

~~~text
same inherited collector contract
→ SQL durable authority
→ trusted read contracts
→ Current Universe
→ Security Detail/History
~~~

Mandatory exit evidence:
- collector characterization green;
- persistence checkpoint green;
- production runtime build reproducible;
- Recorder→SQL mocked integration green;
- trusted-read contract suite green;
- Current parity green;
- Detail/History parity green;
- Viewer lifecycle/recovery green;
- full parity corpus green;
- L-2 live PASS;
- Fast CI green;
- full Browser CI green;
- no secret/artifact violations;
- exact commit/build/evidence identity recorded.

Enrichment and Scanner are explicitly **not** required for this checkpoint.

## 21. Failure routing

If L-1 fails:

~~~text
stop Browser SQL heavy implementation
→ classify Worker/Wasm/OPFS/origin blocker
→ reopen delivery architecture
~~~

If persistence checkpoint fails:

~~~text
stay inside persistence mini-slice
→ diagnose
→ retain regression
→ rerun
~~~

If L-2 fails provider continuity:

~~~text
do not compensate by changing provider semantics casually
→ compare against collector characterization
→ fix integration/runtime boundary
→ rerun L-2
~~~

If parity fails:

~~~text
determine whether V1 behavior, V2 behavior or oracle is wrong
→ fix contract/implementation
→ retain public regression
→ rerun ND-16
~~~

Only a material uncertainty that cannot be resolved by deterministic/browser/live candidate evidence may activate the temporary shadow branch defined in Pass D.

## 22. Recommended commit/checkpoint boundaries

Keep commits small and coherent. A practical sequence is:

~~~text
A verification core
B collector characterization
C self-verifying L-1
D minimum SQL authority/schema
E validated-cycle handoff/staging
F atomic persistence
G durability/recovery
H persistence checkpoint
I production runtime packaging
J trusted reads
K shared Viewer bridge/health
L Current Universe
M Detail/History
N Recorder→SQL integration
O self-verifying L-2
P parity suite consolidation
Q V1-on-SQL checkpoint
~~~

Some independent units may overlap per Pass D3, but a commit must never combine unrelated concerns merely because they were worked on concurrently.

## 23. Expected durable documentation updates during implementation

Update only when the owned contract changes:
- provider-data contract spec for characterized behavior;
- persistence spec for SQL authority/atomicity/durability;
- runtime-delivery spec for generated runtime/Worker ownership;
- viewer spec for SQL-backed Current/Detail behavior;
- testing strategy/policy only if verification policy itself changes;
- architecture docs for durable boundaries.

`STATUS.json` remains the only live progress/current-next source. Do not copy stage snapshots into these docs.

## 24. E1 completion test

Another fresh AI should be able to start implementation by reading:

~~~text
AGENTS.md
→ V2 README
→ STATUS.json
→ AI_CONTEXT.md
→ active canonical Issue once Pass G exists
→ this manual
→ only the code/tests for the current work unit
~~~

and know:
- what behavior is being changed;
- what must remain unchanged;
- what test must fail first;
- which runtime/browser evidence is required;
- when STATUS moves to verification-pending;
- what exactly makes the unit/checkpoint complete.
