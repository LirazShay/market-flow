# Fast Unit Tests

## Mandatory rule

Any added/modified unit test must be executed after its final edit before development continues. Fast CI or `npm run test:unit` must be green; do not defer a changed unit test to a later stage.

This directory is for deterministic tests that do not require Chromium, DOM, IndexedDB, BroadcastChannel, or a live provider.

Run from the prototype root:

~~~text
npm run test:unit
~~~

The command uses Node's built-in `node:test` API through a tiny deterministic launcher:

~~~text
node tests/unit/run-unit-tests.js
~~~

The launcher loads only:

~~~text
tests/unit/*.test.js
~~~

This intentionally prevents Node's default test discovery from trying to execute browser-only self-test files elsewhere under `tests/`.

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


## Stage 8 persistence contracts

~~~text
persistence-records.test.js
~~~

Covers deterministic mapping for:

- universe records;
- session start/stop records;
- complete cycle records;
- history/latest rows;
- recorderState meta records;
- raw field preservation;
- null/zero/empty-string preservation;
- duplicate/mismatch rejection;
- generated ID validation.

IndexedDB transaction behavior remains a Chromium concern for later Stage 8 substeps.
