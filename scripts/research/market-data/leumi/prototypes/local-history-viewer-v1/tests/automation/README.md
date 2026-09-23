# Browser Automation Tests

Playwright/Chromium integration layer for Local History Viewer V1.

## Mandatory rule before continuing development

Any change under this browser-test layer — spec, fixture, harness, helper, or browser-test infrastructure — must be executed in Chromium after its final edit.

Use the smallest sufficient target first:

~~~text
edit/add browser test
→ run exact affected Playwright test

intentional TDD/regression red
→ confirm exact test fails for intended reason
→ implement/fix
→ rerun exact test until green

shared fixture/harness/infrastructure change
→ exact affected test(s) first
→ related cluster if warranted

full Browser suite
→ Stage closure / explicit checkpoint / broad shared-infrastructure risk / suite-only reproduction
~~~

Do not run the full Browser suite merely to prove an expected red.

After implementation code changes, Chromium verification is mandatory on the final changed code state even when the Playwright spec itself did not change. Localized code changes may use a targeted browser test; shared runtime/harness/storage/messaging/viewer-integration or multi-area code changes require the full Browser suite.

A later checkpoint never substitutes for immediate execution of the changed browser test/code path. An **unexpected** red, or a red that remains after the intended fix, blocks the next implementation unit.

Additionally, the **full browser suite is mandatory before every numbered Stage is marked complete**, even if that Stage did not add a browser test in its final substep.

See `../TESTING_POLICY.md` for the full policy.

For failures, RCA, targeted reruns, Playwright traces, race/selector/RTL/scroll debugging, follow `../E2E_DEBUGGING.md`.

## Structure

~~~text
server.js
harness.html
helpers/
    mock-leumi-api.js
specs/
    harness-smoke.spec.js
    storage-self-tests.spec.js
    mock-leumi-api.spec.js
    recorder-stage-7.spec.js
~~~

## What belongs here

Use this layer only when real browser semantics or browser integration matter:

- IndexedDB.
- DOM.
- BroadcastChannel.
- same-origin/browser adapters.
- mocked fetch wiring.
- broad integration checkpoints.

Pure deterministic logic belongs in:

~~~text
../unit/
~~~

External Leumi behavior is not tested live in GitHub Actions.

