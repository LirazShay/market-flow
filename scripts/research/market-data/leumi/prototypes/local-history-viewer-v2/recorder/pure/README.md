# Recorder Pure Logic

Browser-independent deterministic logic used by the recorder.

## Why this folder exists

Code here should be testable with fast Node unit tests without starting Chromium.

Typical responsibilities:

- config validation;
- universe/chunk planning;
- GetSecuritiesData request/response validation;
- complete-cycle validation;
- recorder scheduling/state logic.

Browser APIs such as `fetch`, `window`, timers and IndexedDB stay in thin adapter modules one level up.

## Tests

Relevant fast tests:

~~~text
../../tests/unit/
~~~

Rule:

~~~text
deterministic behavior → pure module + unit test
browser semantics      → adapter + Playwright checkpoint
~~~

