# Local History Viewer V1 — Testing

Durable testing overview only. Operational completion and latest run evidence live in:

~~~text
../STATUS.json
~~~

The authoritative execution/checkpoint policy is:

~~~text
TESTING_POLICY.md
~~~

## Non-negotiable test-change gate

~~~text
change test / fixture / harness / helper
→ execute that changed test in its real layer
→ fix every failure
→ rerun until green
→ only then continue
~~~

A red or unexecuted changed test blocks progression.

## Test layers

### Fast unit tests

Use for deterministic behavior that does not require browser semantics.

~~~text
npm test
npm run test:unit
~~~

Implementation:

~~~text
unit/*.test.js
unit/run-unit-tests.js
~~~

### Browser integration tests

Use for:

- IndexedDB;
- DOM/window lifecycle;
- BroadcastChannel;
- browser fetch/mock wiring;
- recorder→persistence→viewer integration;
- reload/recovery;
- storage growth.

~~~text
npm run test:browser
~~~

Specs:

~~~text
automation/specs/*.spec.js
~~~

### Live provider verification

Only for provider/session behavior that deterministic mocks cannot prove.

No credentials, cookies, tokens or account data belong in CI.

## Mandatory Stage closure gate

~~~text
Fast CI green
+
full Browser CI green on final Stage state
→ Stage may be marked complete in STATUS.json
~~~

## E2E debugging

For non-trivial Playwright failures use:

~~~text
E2E_DEBUGGING.md
~~~

Core loop:

~~~text
evidence
→ classify
→ hypothesis
→ smallest experiment
→ targeted rerun
→ RCA
→ minimal fix
→ targeted green
→ broader regression
~~~

Do not repeatedly rerun the full suite during diagnosis when a targeted test can reject/confirm the current hypothesis.

The same cost rule applies to tests-first development:

~~~text
new/changed browser test
→ exact targeted Chromium run

expected TDD red
→ confirm intended failure
→ implement/fix
→ exact targeted green

full Browser suite
→ required Stage/checkpoint or broad/suite-level risk
~~~

An expected red from the newly written target is not a reason to run the whole Browser suite.

Once implementation code changes, the final changed code state must be exercised in Chromium. Use a targeted browser test/spec for a truly localized change; use the full Browser suite for shared runtime/harness/storage/messaging/viewer integration, cross-component, or multi-area changes.

## Browser harness

~~~text
automation/server.js
automation/harness.html
automation/helpers/
automation/specs/
~~~

The harness runs the real browser modules in Chromium with deterministic sanitized provider fixtures.

## Fixtures

~~~text
fixtures/leumi-api-fixtures.js
automation/helpers/mock-leumi-api.js
~~~

Fixtures must not contain private session/account material.

## Historical verification evidence

Historical run narratives belong under:

~~~text
../docs/history/
~~~

Do not add current/next/completion snapshots to this README.
