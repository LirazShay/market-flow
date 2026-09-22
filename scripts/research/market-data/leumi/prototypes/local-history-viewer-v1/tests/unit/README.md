# Fast Unit Tests

This directory is for deterministic tests that do not require Chromium, DOM, IndexedDB, BroadcastChannel, or a live provider.

Run from the prototype root:

~~~text
npm run test:unit
~~~

The command uses Node's built-in test runner:

~~~text
node --test
~~~

## Naming

Fast unit tests use:

~~~text
*.test.js
~~~

Playwright browser tests remain under:

~~~text
tests/automation/specs/*.spec.js
~~~

This naming split lets `node --test` discover the fast tests without loading the Playwright specs.

## T2 smoke test

~~~text
harness-smoke.test.js
~~~

It proves that:

- the Node test runner works;
- no browser global is required;
- CommonJS test fixtures can be loaded on the fast path.

Production/browser logic extraction is intentionally deferred to T3.


## T4 fast test base

The fast suite now covers the deterministic recorder foundation:

~~~text
config-logic.test.js
universe-logic.test.js
leumi-api-fixtures.test.js
~~~

Coverage includes:

- default/override config behavior;
- invalid config values;
- chunk boundary/remainder behavior;
- dynamic MapHeat URL pageCount;
- PaperId canonicalization and ordering;
- missing/duplicate PaperId failures;
- record-count validation;
- full-universe completeness validation;
- synthetic fixture isolation;
- null vs zero fixture preservation;
- deterministic mocked failure scenarios.

These tests deliberately do not duplicate IndexedDB/DOM/BroadcastChannel behavior, which remains browser-test territory.
