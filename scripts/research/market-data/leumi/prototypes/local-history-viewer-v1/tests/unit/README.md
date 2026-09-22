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
