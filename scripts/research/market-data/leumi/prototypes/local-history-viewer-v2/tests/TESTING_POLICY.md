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
