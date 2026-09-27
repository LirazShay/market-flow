# Local History Viewer V2 — Testing Policy

V2 follows the repository-wide rules in `AGENTS.md`. This file owns only V2-specific test execution guidance.

## Test layers

~~~text
pure deterministic logic
→ Node unit tests

IndexedDB / DuckDB-Wasm / OPFS / DOM / BroadcastChannel / browser integration
→ Playwright + Chromium

current authenticated provider/session behavior
→ explicit live verification
~~~

## Change flow

For new behavior, when practical:

~~~text
observable contract
→ smallest meaningful test
→ intended red
→ implementation
→ exact target green
→ broaden only as required
~~~

For a bug:

~~~text
regression test
→ intended red
→ fix
→ regression green
~~~

Tests should protect public/observable behavior rather than private implementation details.

## Automation-first verification

Human checking is not a substitute for an assertion that can be automated.

Default rule:

~~~text
if GitHub Actions / Node / Chromium / a deterministic mock / fault injection
can prove the behavior
→ automate it
→ do not leave it as a user checklist
~~~

During implementation, temporary engineering tests and POC workflows are allowed and encouraged when they answer a concrete uncertainty faster or more safely than coding forward blindly.

Temporary verification may include:

- focused synthetic provider fixtures;
- browser capability probes;
- failure injection;
- crash/reopen scenarios;
- targeted performance experiments;
- implementation-comparison/parity probes;
- one-off diagnostic assertions.

After the question is resolved:

~~~text
protects a durable public contract/regression
→ keep it as permanent coverage

exploratory only
→ remove the temporary test/workflow/scaffolding
~~~

Do not accumulate permanent suite noise merely because a POC was useful once.

The objective is that a human is asked to participate only where the authenticated real origin/session is technically unavailable to CI. Even there, the live artifact must self-verify its assertions and emit an explicit sanitized PASS/FAIL result; the human must not be asked to visually judge product correctness when code can decide it.

## Fast verification

Command:

~~~text
npm run test:unit
~~~

GitHub workflow:

~~~text
Local History Viewer V2 Fast CI
~~~

Fast CI is the normal push/PR gate.

## Browser verification

Command:

~~~text
npm run test:browser
~~~

GitHub workflow:

~~~text
Local History Viewer V2 Browser CI
~~~

Rules:

- any added/modified Playwright test must run in Chromium after its final edit;
- any production/runtime/browser code change must receive Chromium verification on the final changed state;
- localized changes may use a targeted Chromium spec/test first;
- storage, messaging, runtime assembly, viewer integration or cross-component changes require the full Browser suite;
- closing a coherent browser/runtime mini-project or cross-component integration boundary requires Fast CI + full Browser CI;
- an unexpected red blocks progression until diagnosed and fixed.

The V2 bootstrap baseline/isolation checkpoint requires the full Browser suite before bootstrap can be closed.

## Live provider verification

Do not put credentials, cookies, tokens, account data or private session data in CI.

Use live Leumi verification only when mocks/browser tests cannot prove the current provider behavior.

Live verification must be automated as far as technically possible. The preferred live artifact performs the checks itself and returns sanitized machine-readable PASS/FAIL evidence. If an authenticated local session must launch the artifact, user involvement is limited to that unavoidable session boundary rather than manual inspection of assertions.

## Failure diagnosis

Use:

~~~text
tests/E2E_DEBUGGING.md
~~~

If a meaningful unexpected failure occurs, apply the repository Failure Review / continuous-improvement rules before closing the incident.

## Browser SQL planning target

Current durable Browser SQL authorities:

~~~text
docs/project/decisions/D-043.md
→ product/provider continuity + three Viewer surfaces

docs/project/decisions/D-044.md
→ post-KISS implementation/testing baseline

../docs/browser-sql-compact-execution-dag.md
→ C01..C12 dependency rationale
~~~

Browser SQL keeps the existing three-layer rule:

~~~text
pure deterministic behavior
→ Node unit tests

Worker / Wasm / OPFS / DOM / Runtime / Viewer / Web Locks / Scanner
→ Playwright + real Chromium

authenticated Leumi origin/provider behavior that CI cannot prove
→ explicit self-verifying live verification
~~~

### C01 — mandatory implementation-entry live premise

Before production Browser SQL implementation depends on the selected page-runtime delivery, C01 must prove the minimal authenticated-Leumi premise with synthetic probe data only:

~~~text
injected JS
→ Blob Worker
→ exact pinned DuckDB Worker/Wasm
→ OPFS probe database
→ synthetic SQL write + COMMIT
→ close/reopen Worker/runtime
→ verify marker
→ probe-only cleanup
~~~

A mock Chromium page cannot substitute for this real-origin premise.

The existing deterministic synthetic probe/preflight remains useful browser-mechanics evidence, but it does not prove the authenticated Leumi origin.

The probe may use CHECKPOINT internally as part of its regression sequence; that does **not** define production CHECKPOINT cadence or the C03 durability/acknowledgement contract.

Real-origin Web Lock proof is **not** an early C01 blocker. Web Lock mechanics are verified in Chromium under C10, and authenticated two-tab ownership is verified at final readiness in C12.

If C01 fails because of real CSP/origin/browser constraints, dependent production SQL work stops and the runtime-delivery premise is reconsidered from evidence.

### Browser SQL CI cadence

Fast CI remains the normal push/PR gate.

Use targeted Chromium during browser TDD/debugging.

Any added/modified Playwright test must run in Chromium after its final edit.

A browser-dependent production/runtime change must receive Chromium verification on the final changed state.

Run the full Browser suite when closing a coherent browser/runtime slice or when a change crosses storage/runtime/Recorder/Viewer/Scanner/ownership boundaries.

Docs-only, planning-only and pure Node-only changes do not automatically require Browser CI.

Representative day-scale workload evidence belongs to C11 and does not need to run on every push when it is materially heavier than the normal Browser suite.

### Browser SQL permanent verification areas

Keep permanent regression coverage focused on observable contracts:

~~~text
Provider / Data
SQL Storage
Viewer
Ownership
Scanner
Integrated Daily Workload
~~~

Do not require tests for unselected mechanisms such as fixed horizon schemas, immutable query-version history, anchored scheduling, advanced preemption, automatic archive/rollover or generalized upgrade migration.

If a conditional mechanism is activated by evidence, add focused tests for that mechanism and rerun the affected owning verification.

### Live verification moments

Normal initial-V2 live verification has only three purpose-specific moments:

~~~text
C01
→ real-origin Worker/Wasm/OPFS premise

C06 / L-2
→ real provider → complete validation → SQL → trusted read

C12
→ final integrated real-origin run + two-tab ownership before cutover
~~~

Each live artifact must self-verify as far as technically possible and emit sanitized machine-readable PASS/FAIL evidence.

Do not create a generalized live-gate/evidence platform unless repeated implementation pain proves one is necessary.
