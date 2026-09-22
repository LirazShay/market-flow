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

## 0. Hard verification gate for test changes

### Non-negotiable test-change gate

Checkpoint scheduling controls **when broad suites are run for unchanged tests**. It never permits an edited test to remain unexecuted.

If a test, test fixture, harness, or test helper is added or modified:

~~~text
change test
→ execute that test in its real layer immediately
→ fix every failure
→ rerun until green
→ only then continue to the next implementation unit
~~~

Rules:

- changed unit tests must be executed before continuing;
- changed Playwright/browser tests must be executed in Chromium before continuing;
- if targeted browser execution is unavailable in CI, run the Browser suite rather than defer the changed test;
- a planned later Browser checkpoint is **not** permission to leave newly added/modified browser tests unexecuted;
- a failing test blocks progression: inspect logs, decide whether product code or the test is wrong, fix, and rerun;
- if the required environment cannot be run, mark the work `verification-pending` in `STATUS.json` and stop before the next feature/substep;
- do not mark behavior verified from source inspection alone when its test layer has not run;
- verification evidence must identify the run and code/test state being claimed as verified.

This gate applies even when Fast CI is green.

### Mandatory Browser CI at every Stage closure

Before **any numbered Stage** is marked `complete`, the full Browser CI suite must pass against the final code/test state of that Stage.

~~~text
Stage implementation complete
→ Fast CI green
→ full Browser CI green
→ only then Stage = complete
~~~

Broad checkpoints remain useful as additional integration milestones, but they never replace this per-Stage Browser CI gate.

## 1. Default execution rule

For ordinary implementation work:

~~~text
every commit
→ Fast CI

browser behavior/test changed
→ Chromium before continuing

numbered Stage ready to close
→ full Browser CI
→ only then mark Stage complete
~~~

Do **not** run Chromium merely because a small substep or documentation-only commit completed. But Stage closure is always a Browser CI boundary.

A changed browser test or material browser-only implementation change must be verified immediately; do not wait for Stage closure.

## 1.1 Tests-first change rule

For new behavior, define the externally meaningful test cases before implementation whenever practical.

For a bug fix:

~~~text
reproduce with a regression test
→ fix implementation
→ keep the regression test
~~~

Tests should target public behavior/contracts rather than private implementation details.

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

## 4. Additional V1 integration checkpoints

The checkpoints below are **additional broad integration milestones**. They no longer define the minimum Browser CI frequency.

Minimum mandatory cadence:

~~~text
changed browser behavior/test
→ Chromium immediately

every numbered Stage closure
→ full Browser CI
~~~

The checkpoints below add extra integration intent across related stages.

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

Run after the Stage 8 persistence group is complete.

Purpose:

- verify session/universe lifecycle persistence;
- verify atomic cycles/history/latest/meta commit;
- verify recorder commit-before-in-memory-success boundary;
- verify DB rollback and no-partial-write behavior.

Stage 9 still requires its own full Browser CI before Stage 9 can be marked complete. Checkpoint B remains useful as the Stage 8 persistence milestone.

Verification results belong in `STATUS.json`, not in this policy document.

### Checkpoint C — Viewer live-refresh boundary

Run after the Stage 12 viewer live-refresh group is ready for closure.

Purpose:

- verify DOM + same-origin viewer bootstrap;
- verify IndexedDB current-table rendering;
- verify BroadcastChannel metadata-only notifications;
- verify recorder commit → viewer DB reread;
- verify manual DB-only refresh;
- verify BroadcastChannel-unavailable degraded fallback.

After this checkpoint is accepted and recorded in `STATUS.json`, sorting logic should still prefer fast unit tests for deterministic behavior. Stage 13 nevertheless requires a full Browser CI run before Stage 13 closure, and any changed browser test/UI behavior requires immediate Chromium verification.

Verification results belong in `STATUS.json`, not in this policy document.

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

## 5. Immediate browser-verification rule

This is no longer merely an exception. Chromium verification is mandatory before continuing whenever a change materially touches browser-only behavior or changes browser tests/infrastructure.

Examples:

- IndexedDB transaction semantics changed;
- BroadcastChannel behavior changed;
- DOM bootstrap contract changed;
- browser fetch adapter changed in a way not covered by pure tests;
- a browser-only regression is being fixed.

Pure deterministic refactors that do not affect browser behavior and do not change browser tests can remain on the Fast CI path until the mandatory full Browser CI at Stage closure.

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
- every added/modified test has been executed after its final edit in the layer where it actually runs;
- every changed browser test has passed Chromium before the next implementation unit starts;
- if a numbered Stage is being closed, full Browser CI passed on the final Stage state;
- any additional integration checkpoint that is due also passed;
- any live-provider verification that cannot be automated is explicitly marked pending.

If a changed test has not run, the work is not locally verified. If a changed test is red, progression is blocked.

No numbered Stage is complete until its own full Browser CI closure gate passes. Additional checkpoints above may impose further integration verification.
