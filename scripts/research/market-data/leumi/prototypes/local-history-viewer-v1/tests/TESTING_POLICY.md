# Local History Viewer V1 — Testing Policy

This is the durable test-layer and checkpoint policy for the V1 prototype.

Goal:

~~~text
fast feedback on ordinary changes
+
browser confidence at meaningful integration boundaries
+
rare live-provider verification
~~~

## 1. Default execution rule

For ordinary implementation work:

~~~text
change code
→ add/update fast unit tests where applicable
→ Fast CI runs automatically
→ continue development
~~~

Do **not** run Chromium merely because a numbered substage completed.

Browser CI is a checkpoint tool, not the default feedback loop.

## 2. Test layers

### Fast unit tests

Use for deterministic behavior that does not require browser semantics.

Examples:

- configuration validation;
- chunk planning;
- PaperId validation/canonicalization;
- count/completeness validation;
- pure response parsing/normalization;
- sorting/computation logic;
- cycle validation logic that can be separated from browser I/O.

Command:

~~~text
npm run test:unit
~~~

### Browser integration tests

Use only when the behavior depends on real browser semantics or a cross-component browser boundary.

Examples:

- IndexedDB schema/transactions/reopen;
- DOM/viewer behavior;
- BroadcastChannel;
- same-origin integration;
- browser fetch adapter wiring;
- recorder→IndexedDB→viewer integration;
- reload/recovery behavior.

Command:

~~~text
npm run test:browser
~~~

GitHub workflow:

~~~text
Local History Viewer V1 Browser CI
~~~

Trigger:

~~~text
manual workflow_dispatch
or
workflow_call from an explicit checkpoint workflow
~~~

### Live provider verification

Use only for behavior that cannot be proven with deterministic mocks.

Examples:

- current Leumi response shape;
- actual provider/session behavior;
- final live V1 integration.

No credentials, cookies, tokens or account data belong in CI.

## 3. Existing test migration map

### Fast unit layer

~~~text
tests/unit/harness-smoke.test.js
tests/unit/pure-module-smoke.test.js
tests/unit/config-logic.test.js
tests/unit/universe-logic.test.js
tests/unit/leumi-api-fixtures.test.js
~~~

These should grow as new deterministic logic is introduced.

### Browser layer

Browser-only self-tests:

~~~text
tests/storage-schema-self-test.js
tests/storage-fixture-roundtrip-self-test.js
tests/storage-cleanup-reopen-self-test.js
~~~

Playwright integration specs:

~~~text
tests/automation/specs/harness-smoke.spec.js
tests/automation/specs/storage-self-tests.spec.js
tests/automation/specs/mock-leumi-api.spec.js
~~~

These remain in the browser layer because they verify real browser APIs or adapter integration.

### Live layer

No automated live Leumi test belongs in normal CI.

The planned live-provider checkpoint remains V1 Stage 19.2.

## 4. Remaining V1 browser checkpoints

To keep Chromium runs sparse, use these planned boundaries.

### Checkpoint A — Recorder skeleton complete

Run after the Stage 7 recorder group is complete:

~~~text
7.3 single chunk fetch
7.4 complete cycle builder
7.5 loop shell
7.6 mocked recorder tests
→ Browser CI
~~~

Purpose:

- verify browser fetch adapter integration;
- verify mocked endpoint wiring;
- verify recorder browser globals still compose correctly.

### Checkpoint B — Persistence integration complete

Run after Stage 8.

Purpose:

- verify real IndexedDB transaction behavior;
- verify complete-cycle persistence;
- verify no partial visible state on failure.

Stage 9 recorder diagnostics does not require another browser run by itself unless it changes browser-only behavior.

### Checkpoint C — Viewer live-refresh foundation complete

Run after Stages 10–12:

~~~text
10 viewer bootstrap
11 current table
12 cross-tab live refresh
→ Browser CI
~~~

Purpose:

- verify DOM + IndexedDB + BroadcastChannel integration.

Stage 13 sorting should primarily use fast unit tests unless browser/UI behavior changes materially.

### Checkpoint D — Viewer history/diagnostics complete

Run after Stages 14–15:

~~~text
14 history drill-down
15 viewer diagnostics
→ Browser CI
~~~

### Checkpoint E — Recovery/failure behavior complete

Run after Stages 16–17:

~~~text
16 reload/recovery
17 failure simulation
→ Browser CI
~~~

### Checkpoint F — Storage growth validation

Stage 18 is browser-storage dependent and gets its own browser checkpoint.

### Checkpoint G — Integrated mocked V1

Stage 19.1 is a full mocked browser E2E checkpoint.

### Live checkpoint

Stage 19.2:

~~~text
manual live Leumi verification
~~~

Only provider-dependent behavior is checked here.

### Long-run checkpoint

Stage 19.3 validates long-run behavior.

Use the cheapest valid environment for each part; browser execution is required where browser storage/session behavior matters.

### Freeze checkpoint

Before Stage 20 is frozen:

~~~text
Fast unit suite
+
full Browser CI
+
all required Stage 19 evidence
~~~

must be green/recorded.

## 5. Early-browser exception

An unscheduled Browser CI run is justified only when a change materially touches browser-only behavior and waiting until the next planned checkpoint would leave too much integration risk.

Examples:

- IndexedDB transaction semantics changed;
- BroadcastChannel behavior changed;
- DOM bootstrap contract changed;
- browser fetch adapter changed in a way not covered by pure tests;
- a browser-only regression is being fixed.

Do not use this exception for pure logic refactors that are fully covered by unit tests.

## 6. Test-placement rule

Use the cheapest layer that proves the behavior correctly:

~~~text
pure deterministic logic
→ unit

browser API / browser integration
→ Playwright

external provider behavior
→ live verification
~~~

Do not test private/internal implementation details unless they are themselves a durable contract.

Prefer public inputs, outputs, persistence effects and user-visible behavior.

## 7. Completion rule for ordinary development

A normal implementation change can be considered locally verified when:

- relevant fast unit tests pass;
- Fast CI passes;
- no required browser checkpoint is due;
- any browser/live verification that is genuinely required is explicitly marked pending.

A stage group that reaches one of the checkpoints above is not complete until its Browser CI checkpoint passes.
