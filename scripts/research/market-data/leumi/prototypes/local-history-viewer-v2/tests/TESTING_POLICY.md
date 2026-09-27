# Local History Viewer V2 — Testing Policy

V2 follows the repository-wide rules in `AGENTS.md`. This file owns only V2-specific test execution guidance.

## Test layers

~~~text
pure logic + protocol + native DuckDB service/database integration
→ Node tests with synthetic temporary DBs

browser runtime + WebSocket + Recorder + Viewer + Scanner integration
→ Playwright + Chromium + local test service

current authenticated Leumi provider/origin behavior that CI cannot prove
→ one bounded self-verifying final live cutover gate
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

## Node-SQL test pyramid

The migration is designed to be testable while the exchange is closed.

~~~text
pure protocol / validation / scheduling / presentation logic
→ focused unit tests

local-service protocol / DuckDB transactions / restart / reads / Scanner safety
→ real ws + real temporary DuckDB service integration tests

browser runtime / provider collection / Recorder / Viewer / Scanner
→ Chromium against real loopback Fake Leumi HTTP + real local service

~561-security growth/performance
→ separate accelerated workload gate

real authenticated Leumi facts only
→ one final self-verifying cutover gate
~~~

The canonical offline provider environment serves the same MapHeat2/GetSecuritiesData paths from sanitized synthetic scenarios. Main happy-path browser E2E must use the real Fake Leumi HTTP server rather than request interception. Focused malformed/failure tests may still use Playwright routing when it is the smallest isolated proof.

Every implementation leaf should add/adjust the cheapest public-contract proof first when practical, then broaden only across boundaries affected by that leaf.

A one-command local Fake Leumi demo must reuse the same simulator and Node service as CI so local manual exercise is not a separate implementation.

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

## Node SQL planning target

Current durable authorities:

~~~text
docs/project/decisions/D-043.md
→ provider/data continuity + three Viewer surfaces

docs/project/decisions/D-045.md
→ localhost Node.js + native DuckDB authority boundary

.planning/TREE.yaml
→ frozen implementation contract after Final Planning Review
~~~

Permanent verification areas:

~~~text
Provider / Data
Protocol / Local Service
DuckDB Persistence
Viewer Current + Detail/History
Scanner
Integrated Mixed Workload
Cutover / Rollback
~~~

Fast CI remains the normal push/PR gate.

Use targeted Chromium during browser TDD/debugging. Any added/modified Playwright test must run in Chromium after its final edit. Cross-component/runtime closure requires full Browser CI.

The representative 561-security workload is a separate required-before-cutover workflow rather than an every-push gate.

Authenticated live verification occurs once on the final candidate. It must self-verify and emit sanitized PASS/FAIL evidence. If the current assistant environment cannot control the authenticated browser/session, the cutover remains verification-pending; do not replace automation with a user checklist.

Do not create generalized release/evidence platforms, background replay/reconnect systems, workload optimizers or query-governance machinery unless concrete evidence activates a current need.
