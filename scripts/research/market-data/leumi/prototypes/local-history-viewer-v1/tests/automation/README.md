# Browser Automation Tests

Playwright/Chromium integration layer for Local History Viewer V1.

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

