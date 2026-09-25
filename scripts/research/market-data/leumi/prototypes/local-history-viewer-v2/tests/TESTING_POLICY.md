# Local History Viewer V2 — Testing Policy

V2 follows the repository-wide rules in `AGENTS.md`. This file owns only V2-specific test execution guidance.

## Test layers

~~~text
pure deterministic logic
→ Node unit tests

IndexedDB / DOM / BroadcastChannel / browser integration
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
- any numbered V2 Stage closure requires Fast CI + full Browser CI;
- an unexpected red blocks progression until diagnosed and fixed.

The V2 bootstrap baseline/isolation checkpoint requires the full Browser suite before bootstrap can be closed.

## Live provider verification

Do not put credentials, cookies, tokens, account data or private session data in CI.

Use live Leumi verification only when mocks/browser tests cannot prove the current provider behavior.

## Failure diagnosis

Use:

~~~text
tests/E2E_DEBUGGING.md
~~~

If a meaningful unexpected failure occurs, apply the repository Failure Review / continuous-improvement rules before closing the incident.

## Browser SQL planning target

Durable strategy:

~~~text
../docs/browser-sql-testing-verification-strategy.md
~~~

Browser SQL keeps the existing three-layer rule:

~~~text
pure deterministic behavior
→ Node unit tests

Worker / Wasm / OPFS / DOM / runtime / Viewer integration
→ Playwright + real Chromium

authenticated Leumi CSP/origin/provider behavior
→ explicit live verification
~~~

### Mandatory implementation-entry live gate

Before heavy Browser SQL implementation depends on the selected page-runtime delivery, run the minimal authenticated-Leumi compatibility probe defined by the strategy.

It must prove with synthetic data only:

~~~text
Bookmarklet/injected JS
→ Blob Worker
→ pinned DuckDB Worker/Wasm
→ OPFS test database
→ write + COMMIT + CHECKPOINT
→ refresh/relaunch
→ reopen + verify
~~~

A mock Chromium page cannot substitute for this real-page gate.

Before the live gate, the dedicated synthetic Leumi preflight may exercise the same browser primitives automatically in GitHub Actions:

~~~text
tests/automation/mock-leumi-authenticated.html
tests/automation/specs/browser-sql-live-gate-poc.spec.js
Local History Viewer V2 WP-03 POC CI
~~~

This deterministic preflight should cover same-origin two-tab Web Locks, Blob Worker, exact pinned Worker/Wasm, OPFS persistence, COMMIT/CHECKPOINT/reopen and probe-only cleanup. Its result is browser-mechanics evidence only and must be classified as Inferred for the real authenticated Leumi origin.

If it fails because of real CSP/origin/browser constraints, dependent implementation work stops and the runtime-delivery architecture must be reconsidered from evidence.

### Browser SQL CI cadence

Fast CI remains the normal push/PR gate.

Use targeted Chromium during browser TDD/debugging.

Full Browser CI is required on final browser-dependent Stage state and before publishing a generated runtime.

Correctness CI must remain small/deterministic; benchmark-scale data belongs to the dedicated performance benchmark plan.