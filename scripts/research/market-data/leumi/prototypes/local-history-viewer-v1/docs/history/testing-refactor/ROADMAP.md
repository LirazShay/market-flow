# Testing Refactor Roadmap

Operational progress:

~~~text
STATUS.json
~~~

This roadmap defines scope/order only.

---

## T1 — Audit + target architecture

Deliver:

- testing pyramid;
- current-cost diagnosis;
- classification rules for unit vs browser vs live tests;
- migration roadmap;
- explicit resume point for product development.

No production behavior changes.

## T2 — Fast unit-test harness

Add:

- Node built-in test runner;
- unit-test directory structure;
- package scripts;
- one smoke test proving the fast path works.

Target command:

~~~text
npm run test:unit
~~~

No Chromium installation or browser startup.

## T3 — Extract deterministic logic from browser adapters

Refactor only where needed to make deterministic logic testable outside the browser.

Initial candidates:

~~~text
recorder/config.js
recorder/universe-loader.js
~~~

Separate pure logic such as:

- config validation;
- chunk creation;
- PaperId validation;
- response-shape validation where practical.

Preserve existing browser globals/observable behavior.

## T4 — Build the fast unit-test base

Add many fast tests for deterministic/public behavior, including:

- config defaults/overrides/errors;
- chunk boundaries;
- PaperId canonicalization;
- missing/duplicate IDs;
- count/completeness validation;
- null/zero/empty distinctions where logic applies;
- error messages/contracts that matter externally.

Avoid duplicating browser-only IndexedDB coverage.

## T5 — Split CI by speed and purpose

Create two layers.

### Fast CI

Runs on ordinary relevant push/PR changes:

~~~text
npm run test:unit
~~~

Goal: seconds-level feedback.

### Browser CI

Runs only at meaningful checkpoints, such as:

- manual workflow dispatch;
- selected PR/checkpoint usage;
- explicit stage-boundary verification.

It retains:

- Playwright;
- Chromium;
- IndexedDB integration;
- mocked API browser integration;
- later DOM/BroadcastChannel E2E.

The browser workflow should no longer install Chromium for every small prototype code push.

## T6 — Migration + checkpoint policy

Classify existing and future tests.

Default rule:

~~~text
pure deterministic logic
→ unit

browser API / IndexedDB / DOM / BroadcastChannel
→ Playwright

full external provider behavior
→ live verification
~~~

Define when full browser suites are required during the remaining V1 roadmap.

## T7 — End-to-end verification of the testing system

Verify:

- fast unit workflow passes;
- browser workflow still passes when intentionally invoked;
- no important existing coverage was accidentally removed;
- docs/status accurately describe both layers.

Then freeze the testing-refactor mini-project and return to:

~~~text
Stage 7.3 — Single chunk fetch
~~~
